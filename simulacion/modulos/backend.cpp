#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <cstring>
#include "modulos/config.h"
#include "modulos/backend.h"
#include "modulos/wifi_mod.h"

#ifndef BACKEND_ALLOW_INSECURE_TLS
#define BACKEND_ALLOW_INSECURE_TLS 1
#endif

#ifndef BACKEND_ROOT_CA_PEM
#define BACKEND_ROOT_CA_PEM ""
#endif

// Backoff exponencial para reintentos.
static unsigned long s_backoffMs = 0;
static const unsigned long BACKOFF_MAX_MS = 30000;
static const unsigned long BACKOFF_BASE_MS = 1000;

String backendBaseUrl() {
  return BACKEND_MODE == BACKEND_PUBLIC ? String(BACKEND_BASE_URL_PUBLIC) : String(BACKEND_BASE_URL_LOCAL);
}

String backendReadingsUrl() {
  return backendBaseUrl() + "/api/readings";
}

String backendModeTexto() {
  return BACKEND_MODE == BACKEND_PUBLIC ? "PUBLIC" : "LOCAL";
}

static bool backendUsaHttps(const String &url) {
  return url.startsWith("https://");
}

static void updateBackoff(bool success) {
  if (success) {
    s_backoffMs = 0;
  } else {
    if (s_backoffMs == 0) {
      s_backoffMs = BACKOFF_BASE_MS;
    } else {
      s_backoffMs = min(s_backoffMs * 2, BACKOFF_MAX_MS);
    }
  }
}

static bool shouldRetryHttpCode(int code) {
  // 429 Too Many Requests, 500 Internal, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
  return code == 429 || code == 500 || code == 502 || code == 503 || code == 504;
}

void enviarBackend(SystemState &state) {
  if (!asegurarWiFi()) {
    state.backendOnline = false;
    state.backendLastCode = 0;
    state.backendLastMsg = "WiFi desconectado";
    Serial.println("Sin WiFi. No se envio al backend.");
    return;
  }

  // Aplicar backoff si el backend ha estado fallando.
  if (s_backoffMs > 0) {
    static unsigned long lastBackoffAttempt = 0;
    unsigned long now = millis();
    if (now - lastBackoffAttempt < s_backoffMs) {
      Serial.print("Backoff activo: esperando ");
      Serial.print(s_backoffMs);
      Serial.println(" ms antes del siguiente intento.");
      return;
    }
    lastBackoffAttempt = now;
  }

  WiFiClient client;
  WiFiClientSecure secureClient;
  HTTPClient http;
  http.setTimeout(BACKEND_TIMEOUT_MS);

  String url = backendReadingsUrl();
  String payload = "{";
  bool needsComma = false;
  auto appendField = [&](const String &fragment) {
    if (needsComma) {
      payload += ",";
    }
    payload += fragment;
    needsComma = true;
  };

  if (DEVICE_ID > 0) {
    appendField("\"deviceId\":" + String(DEVICE_ID));
  }

  if (HOUSE_ID > 0) {
    appendField("\"houseId\":" + String(HOUSE_ID));
  }

  appendField("\"deviceName\":\"" + String(DEVICE_NAME) + "\"");

  if (String(DEVICE_HARDWARE_UID).length() > 0) {
    appendField("\"hardwareUid\":\"" + String(DEVICE_HARDWARE_UID) + "\"");
  }

  appendField("\"flow_lmin\":" + String(state.flujoLmin, 2));
  appendField("\"pressure_kpa\":" + String(state.presionKPa, 2));
  appendField("\"risk\":" + String(state.nivelRiesgo));
  appendField("\"state\":\"" + estadoTexto(state.estadoSistema) + "\"");
  payload += "}";

  Serial.println(">>> Enviando lectura al backend...");
  Serial.print("Transporte: ");
  Serial.println(backendUsaHttps(url) ? "HTTPS (Railway)" : "HTTP");
  Serial.println(url);
  Serial.print("deviceId="); Serial.println(DEVICE_ID);
  Serial.print("houseId="); Serial.println(HOUSE_ID);
  Serial.print("hardwareUid="); Serial.println(DEVICE_HARDWARE_UID);
  Serial.println(payload);

  bool httpIniciado = false;
  if (backendUsaHttps(url)) {
#if BACKEND_ALLOW_INSECURE_TLS
    secureClient.setInsecure();
#else
    if (std::strlen(BACKEND_ROOT_CA_PEM) > 0) {
      secureClient.setCACert(BACKEND_ROOT_CA_PEM);
    } else {
      state.backendOnline = false;
      state.backendLastCode = -2;
      state.backendLastMsg = "TLS seguro requiere BACKEND_ROOT_CA_PEM";
      Serial.println("TLS seguro habilitado, pero falta BACKEND_ROOT_CA_PEM.");
      Serial.println("Define BACKEND_ROOT_CA_PEM o usa BACKEND_ALLOW_INSECURE_TLS=1 solo en desarrollo.");
      return;
    }
#endif
    httpIniciado = http.begin(secureClient, url);
  } else {
    httpIniciado = http.begin(client, url);
  }

  if (!httpIniciado) {
    state.backendOnline = false;
    state.backendLastCode = -1;
    state.backendLastMsg = "No se pudo iniciar HTTP/HTTPS";
    Serial.println("No se pudo iniciar HTTP/HTTPS");
    updateBackoff(false);
    return;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-key", INGEST_API_KEY);

  int httpCode = http.POST(payload);
  state.backendLastCode = httpCode;
  Serial.print("HTTP Code: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    String resp = http.getString();
    state.backendLastMsg = resp.substring(0, 120);
    state.backendOnline = httpCode >= 200 && httpCode < 300;
    Serial.print("Respuesta backend: ");
    Serial.println(resp);

    if (state.backendOnline) {
      state.backendEnvios++;
      updateBackoff(true);
      Serial.print("Envios backend OK: ");
      Serial.println(state.backendEnvios);
    } else if (shouldRetryHttpCode(httpCode)) {
      updateBackoff(false);
      Serial.print("HTTP ");
      Serial.print(httpCode);
      Serial.print(" detectado. Backoff aumentado a ");
      Serial.print(s_backoffMs);
      Serial.println(" ms.");
    }
  } else {
    state.backendOnline = false;
    state.backendLastMsg = http.errorToString(httpCode);
    Serial.print("Error HTTP: ");
    Serial.println(http.errorToString(httpCode));
    updateBackoff(false);
  }

  http.end();
}

