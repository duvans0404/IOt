"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getTrustProxySetting,
  shouldSyncSchema,
  validateRuntimeConfig
} = require("../src/config/env");

const withEnv = (entries, fn) => {
  const previous = new Map();

  for (const [key, value] of Object.entries(entries)) {
    previous.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

test("trust proxy queda desactivado por defecto", () => {
  withEnv({ TRUST_PROXY: undefined }, () => {
    assert.equal(getTrustProxySetting(), false);
  });
});

test("trust proxy acepta presets y enteros validos", () => {
  withEnv({ TRUST_PROXY: "loopback" }, () => {
    assert.equal(getTrustProxySetting(), "loopback");
  });

  withEnv({ TRUST_PROXY: "2" }, () => {
    assert.equal(getTrustProxySetting(), 2);
  });
});

test("trust proxy invalido falla en validacion", () => {
  withEnv({ JWT_SECRET: "super-secret", TRUST_PROXY: "cliente" }, () => {
    assert.throws(() => validateRuntimeConfig(), /TRUST_PROXY debe ser/);
  });
});

test("sync de esquema se desactiva por defecto en produccion", () => {
  withEnv({ NODE_ENV: "production", DB_USE_SYNC: undefined }, () => {
    assert.equal(shouldSyncSchema(), false);
  });
});

test("sync de esquema puede activarse explicitamente en produccion", () => {
  withEnv({ NODE_ENV: "production", DB_USE_SYNC: "true" }, () => {
    assert.equal(shouldSyncSchema(), true);
  });
});
