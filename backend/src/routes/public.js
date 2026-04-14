const express = require("express");
const { getPublicDashboard, streamPublicDashboard } = require("../controllers/publicController");

const router = express.Router();

router.get("/dashboard", getPublicDashboard);
router.get("/dashboard/stream", streamPublicDashboard);

module.exports = router;
