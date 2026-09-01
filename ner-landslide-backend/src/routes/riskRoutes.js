const express = require("express");

const {

    predictRisk,

    predictRiskByLocation,

    getPredictionHistory,

    getPredictionById

} = require("../controllers/riskController");


const router = express.Router();


router.post(
    "/predict",
    predictRisk
);


/*
    New location-based prediction route
*/

router.post(
    "/predict-location",
    predictRiskByLocation
);


router.get(
    "/history",
    getPredictionHistory
);


router.get(
    "/history/:id",
    getPredictionById
);


module.exports = router;