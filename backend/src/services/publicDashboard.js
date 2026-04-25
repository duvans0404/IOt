const { Alert, Device, House, Reading } = require("../models");
const { getUserHouseScope } = require("../middlewares/authorize");

const ONLINE_WINDOW_MS = 10_000; // Con telemetria cada 2 s, 10 s evita falsos offline sin ocultar caidas reales.
const FUTURE_TOLERANCE_MS = 5_000;

const mapReading = (reading) => ({
  id: reading.id,
  deviceId: reading.device_id,
  deviceName: reading.Device?.name || null,
  houseId: reading.Device?.House?.id || null,
  houseName: reading.Device?.House?.name || null,
  ts: reading.ts,
  flow_lmin: reading.flow_lmin,
  pressure_kpa: reading.pressure_kpa,
  risk: reading.risk,
  state: reading.state
});

const mapAlert = (alert) => ({
  id: alert.id,
  deviceId: alert.device_id,
  deviceName: alert.Device?.name || null,
  houseId: alert.Device?.House?.id || null,
  houseName: alert.Device?.House?.name || null,
  ts: alert.ts,
  severity: alert.severity,
  message: alert.message,
  acknowledged: Boolean(alert.acknowledged),
  ack_at: alert.ack_at
});

const isOnlineAt = (value, nowMs = Date.now()) => {
  const timestampMs = value ? new Date(value).getTime() : Number.NaN;
  const isValidTimestamp = Number.isFinite(timestampMs) && timestampMs <= nowMs + FUTURE_TOLERANCE_MS;
  return isValidTimestamp ? nowMs - timestampMs <= ONLINE_WINDOW_MS : false;
};

const mapDeviceReading = (reading, device) => {
  if (!reading) return null;
  return {
    id: reading.id,
    deviceId: device.id,
    deviceName: device.name || null,
    houseId: device.House?.id || device.house_id || null,
    houseName: device.House?.name || null,
    ts: reading.ts,
    flow_lmin: reading.flow_lmin,
    pressure_kpa: reading.pressure_kpa,
    risk: reading.risk,
    state: reading.state
  };
};

const mapDeviceSummary = (device, latestReading, nowMs) => {
  const mappedReading = mapDeviceReading(latestReading, device);
  const lastSeenAt = mappedReading?.ts || device.last_seen_at || null;
  return {
    id: device.id,
    name: device.name || null,
    houseId: device.House?.id || device.house_id || null,
    houseName: device.House?.name || null,
    status: device.status || null,
    lastSeenAt,
    lastState: mappedReading?.state || device.status || "SIN_DATOS",
    online: isOnlineAt(lastSeenAt, nowMs),
    latestReading: mappedReading
  };
};

const buildPublicDashboardPayload = async (user) => {
  const scopedHouseId = getUserHouseScope(user);
  const scopedWhere = scopedHouseId ? { "$Device.house_id$": scopedHouseId } : undefined;
  const [latestReadingRaw, recentReadingsRaw, recentAlertsRaw, devicesRaw] = await Promise.all([
    Reading.findOne({
      include: [
        {
          model: Device,
          attributes: ["name", "house_id"],
          include: [{ model: House, attributes: ["id", "name"], required: false }]
        }
      ],
      where: scopedWhere,
      order: [["ts", "DESC"]]
    }),
    Reading.findAll({
      include: [
        {
          model: Device,
          attributes: ["name", "house_id"],
          include: [{ model: House, attributes: ["id", "name"], required: false }]
        }
      ],
      where: scopedWhere,
      order: [["ts", "DESC"]],
      limit: 60
    }),
    Alert.findAll({
      include: [
        {
          model: Device,
          attributes: ["name", "house_id"],
          include: [{ model: House, attributes: ["id", "name"], required: false }]
        }
      ],
      where: scopedWhere,
      order: [["ts", "DESC"]],
      limit: 20
    }),
    Device.findAll({
      attributes: ["id", "name", "house_id", "status", "last_seen_at"],
      where: scopedHouseId ? { house_id: scopedHouseId } : undefined,
      include: [{ model: House, attributes: ["id", "name"], required: false }],
      order: [["id", "ASC"]],
      limit: 200
    })
  ]);

  const latestReadingsByDevice = new Map(
    await Promise.all(
      devicesRaw.map(async (device) => {
        const reading = await Reading.findOne({
          where: { device_id: device.id },
          order: [["ts", "DESC"]]
        });
        return [device.id, reading];
      })
    )
  );
  const nowMs = Date.now();
  const latestReading = latestReadingRaw ? mapReading(latestReadingRaw) : null;
  const recentReadings = recentReadingsRaw.map(mapReading).reverse();
  const recentAlerts = recentAlertsRaw.map(mapAlert);
  const devices = devicesRaw.map((device) => mapDeviceSummary(device, latestReadingsByDevice.get(device.id), nowMs));
  const lastSeenAt = latestReading?.ts || null;
  const deviceOnline = devices.length ? devices.some((device) => device.online) : isOnlineAt(lastSeenAt, nowMs);
  const currentState = latestReading?.state || "SIN_DATOS";

  return {
    ok: true,
    latestReading,
    recentReadings,
    devices,
    recentAlerts,
    deviceOnline,
    lastSeenAt,
    currentState
  };
};

module.exports = { buildPublicDashboardPayload };
