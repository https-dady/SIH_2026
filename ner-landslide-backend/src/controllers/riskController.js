const asyncHandler = require("../utils/asyncHandler");

const {
    getLandslidePrediction
} = require("../services/mlService");

const PredictionRecord = require("../models/PredictionRecord");


const predictRisk = asyncHandler(async (req, res) => {
    // ML service se prediction lo
    const result = await getLandslidePrediction(req.body);

    // Prediction result MongoDB mein save karo
    const predictionRecord = await PredictionRecord.create({
        inputs: req.body,

        prediction: result.data.prediction,

        probabilities: result.data.probabilities,

        source: "manual"
    });

    res.status(200).json({
        success: true,
        data: result.data,
        recordId: predictionRecord._id
    });
});

const getPredictionHistory = asyncHandler(async (req, res) => {
    const predictions = await PredictionRecord
        .find()
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: predictions.length,
        data: predictions
    });
});

const getPredictionById = asyncHandler(async (req, res) => {
    const prediction = await PredictionRecord.findById(req.params.id);

    if (!prediction) {
        const error = new Error("Prediction record not found");
        error.statusCode = 404;
        throw error;
    }

    res.status(200).json({
        success: true,
        data: prediction
    });
});

module.exports = {
    predictRisk,
    getPredictionHistory,
    getPredictionById
};