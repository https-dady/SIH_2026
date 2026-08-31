const express = require("express");

const {
    predictRisk,
    getPredictionHistory,
    getPredictionById
} = require("../controllers/riskController");

const router = express.Router();


router.post("/predict", predictRisk);
router.get("/history", getPredictionHistory);
router.get("/history/:id", getPredictionById);


module.exports = router;