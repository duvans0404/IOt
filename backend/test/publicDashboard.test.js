"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");

const clearProjectModules = () => {
  for (const modulePath of Object.keys(require.cache)) {
    if (modulePath.startsWith(srcRoot)) {
      delete require.cache[modulePath];
    }
  }
};

const withFreshService = async (overrides, factory) => {
  const targets = Object.entries(overrides).map(([relativePath, exports]) => ({
    resolvedPath: path.join(projectRoot, relativePath),
    exports
  }));
  const previousEntries = new Map();

  try {
    clearProjectModules();
    for (const target of targets) {
      previousEntries.set(
        target.resolvedPath,
        Object.prototype.hasOwnProperty.call(require.cache, target.resolvedPath)
          ? require.cache[target.resolvedPath]
          : null
      );
      require.cache[target.resolvedPath] = {
        id: target.resolvedPath,
        filename: target.resolvedPath,
        loaded: true,
        exports: target.exports
      };
    }

    const service = require(path.join(projectRoot, "src/services/publicDashboard.js"));
    await factory(service);
  } finally {
    clearProjectModules();
    for (const [resolvedPath, previousEntry] of previousEntries.entries()) {
      if (previousEntry) {
        require.cache[resolvedPath] = previousEntry;
      } else {
        delete require.cache[resolvedPath];
      }
    }
  }
};

test("dashboard incluye todos los dispositivos aunque el lote reciente venga de un solo nodo", async () => {
  const house = { id: 7, name: "Casa Norte" };
  const devices = [
    { id: 1, name: "Nodo entrada", house_id: house.id, status: "NORMAL", last_seen_at: "2026-04-24T10:00:00.000Z", House: house },
    { id: 2, name: "Nodo cocina", house_id: house.id, status: "ALERTA", last_seen_at: "2026-04-24T10:00:03.000Z", House: house }
  ];
  const readingForDeviceOne = {
    id: 101,
    device_id: 1,
    ts: "2026-04-24T10:00:00.000Z",
    flow_lmin: 2.1,
    pressure_kpa: 88,
    risk: 14,
    state: "NORMAL",
    Device: { name: "Nodo entrada", House: house }
  };
  const readingForDeviceTwo = {
    id: 202,
    device_id: 2,
    ts: "2026-04-24T10:00:03.000Z",
    flow_lmin: 4.7,
    pressure_kpa: 131,
    risk: 72,
    state: "ALERTA"
  };

  await withFreshService(
    {
      "src/middlewares/authorize.js": {
        getUserHouseScope: () => house.id
      },
      "src/models/index.js": {
        Alert: {
          findAll: async () => []
        },
        Device: {
          findAll: async (query) => {
            assert.deepEqual(query.where, { house_id: house.id });
            return devices;
          }
        },
        House: {},
        Reading: {
          findAll: async () => [readingForDeviceOne, { ...readingForDeviceOne, id: 102 }],
          findOne: async (query) => {
            if (query.where?.device_id === 1) return readingForDeviceOne;
            if (query.where?.device_id === 2) return readingForDeviceTwo;
            return readingForDeviceOne;
          }
        }
      }
    },
    async ({ buildPublicDashboardPayload }) => {
      const payload = await buildPublicDashboardPayload({ id: 12, role: "resident", houseId: house.id });

      assert.equal(payload.recentReadings.length, 2);
      assert.deepEqual([...new Set(payload.recentReadings.map((reading) => reading.deviceId))], [1]);
      assert.deepEqual(payload.devices.map((device) => device.id), [1, 2]);
      assert.equal(payload.devices[1].latestReading.deviceId, 2);
      assert.equal(payload.devices[1].lastState, "ALERTA");
    }
  );
});
