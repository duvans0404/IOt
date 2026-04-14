#include "modulos/config.h"

const char* ssid     = "Wokwi-GUEST";
const char* password = "";

// En este repo dejamos Railway como destino por defecto para evitar que Wokwi
// siga apuntando a host.wokwi.internal cuando ya estas probando el despliegue.
// Si quieres volver a local, cambia BACKEND_MODE a BACKEND_LOCAL.
const BackendMode BACKEND_MODE = BACKEND_PUBLIC;
const char* BACKEND_BASE_URL_LOCAL  = "http://host.wokwi.internal:3000";
const char* BACKEND_BASE_URL_PUBLIC = "https://backend-production-bd4c6.up.railway.app";
const char* DEVICE_NAME = "ESP32-WOKWI-01";
// Esta clave debe ser EXACTAMENTE la misma que la variable INGEST_API_KEY del
// servicio backend en Railway. Si no coincide, el backend responde 401.
const char* INGEST_API_KEY = "wokwi-dev-ingest-key";
// Enviamos con la misma cadencia de medicion para que el dashboard refleje
// los cambios casi al instante sin esperar 15 segundos entre publicaciones.
const unsigned long BACKEND_SEND_INTERVAL_MS = 2000;

const int flowPin    = 27;
const int ledVerde   = 2;
const int ledNaranja = 15;
const int ledRojo    = 4;
const int buzzerPin  = 16;
