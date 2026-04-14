const { buildPublicDashboardPayload } = require("../services/publicDashboard");
const { attachDashboardStream } = require("../services/dashboardStream");

const getPublicDashboard = async (req, res, next) => {
  try {
    const payload = await buildPublicDashboardPayload();
    res.set("Cache-Control", "no-store");
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

const streamPublicDashboard = async (req, res, next) => {
  try {
    const payload = await buildPublicDashboardPayload();
    attachDashboardStream(req, res, payload);
    return undefined;
  } catch (error) {
    return next(error);
  }
};

module.exports = { getPublicDashboard, streamPublicDashboard };
