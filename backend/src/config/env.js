const makeConfigError = (message) => {
  const error = new Error(message);
  error.status = 500;
  return error;
};

const readEnv = (name) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
};

const assertConfiguredSecret = (value, name) => {
  if (!value) {
    throw makeConfigError(`${name} no esta configurada`);
  }

  if (value === "change_me") {
    throw makeConfigError(`${name} no puede usar el valor inseguro "change_me"`);
  }

  return value;
};

const getJwtSecret = () => assertConfiguredSecret(readEnv("JWT_SECRET"), "JWT_SECRET");

const getIngestApiKey = () => {
  const value = readEnv("INGEST_API_KEY");
  if (!value) return "";
  return assertConfiguredSecret(value, "INGEST_API_KEY");
};

const parseBooleanEnv = (name, fallback = false) => {
  const value = readEnv(name);
  if (!value) return fallback;

  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;

  throw makeConfigError(`${name} debe ser un booleano valido`);
};

const getTrustProxySetting = () => {
  const value = readEnv("TRUST_PROXY");
  if (!value) return false;

  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  if (["loopback", "linklocal", "uniquelocal"].includes(normalized)) return normalized;

  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  throw makeConfigError(
    'TRUST_PROXY debe ser false, true, un numero o uno de: "loopback", "linklocal", "uniquelocal"'
  );
};

const shouldSyncSchema = () => {
  const isProd = readEnv("NODE_ENV") === "production";
  return parseBooleanEnv("DB_USE_SYNC", !isProd);
};

const validateRuntimeConfig = () => {
  getJwtSecret();
  getIngestApiKey();
  getTrustProxySetting();
  shouldSyncSchema();
};

module.exports = {
  parseBooleanEnv,
  getJwtSecret,
  getIngestApiKey,
  getTrustProxySetting,
  shouldSyncSchema,
  validateRuntimeConfig
};
