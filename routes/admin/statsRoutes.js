const express = require("express");
const router = express.Router();
const statsController = require("../../controllers/admin/statsController");

// Route pour obtenir les statistiques générales
router.get("/general-stats", statsController.getGeneralStats);

module.exports = router;
