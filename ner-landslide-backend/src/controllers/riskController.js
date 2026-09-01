const asyncHandler = require("../utils/asyncHandler");

const {
    getLandslidePrediction
} = require("../services/mlService");

const {
    getLocationData
} = require("../services/dataAggregatorService");

const {
    prepareMLFeatures
} = require("../services/featurePreparationService");

const PredictionRecord =
    require("../models/PredictionRecord");


const predictRisk = asyncHandler(
    async (req, res) => {

        // Existing manual ML prediction
        const result =
            await getLandslidePrediction(
                req.body
            );

        // Prediction result MongoDB mein save karo
        const predictionRecord =
            await PredictionRecord.create({

                inputs:
                    req.body,

                prediction:
                    result.data.prediction,

                probabilities:
                    result.data.probabilities,

                source:
                    "manual"
            });

        res.status(200).json({

            success: true,

            data:
                result.data,

            recordId:
                predictionRecord._id
        });
    }
);


/*
    New:
    Location-based automatic prediction
*/

const predictRiskByLocation =
    asyncHandler(
        async (req, res) => {

            const {
                latitude,
                longitude
            } = req.body;


            // Validate latitude
            if (
                typeof latitude !== "number"
            ) {

                const error =
                    new Error(
                        "Valid latitude is required"
                    );

                error.statusCode = 400;

                throw error;
            }


            // Validate longitude
            if (
                typeof longitude !== "number"
            ) {

                const error =
                    new Error(
                        "Valid longitude is required"
                    );

                error.statusCode = 400;

                throw error;
            }


            /*
                STEP 1:
                Get raw data from
                all providers
            */

            const rawData =
                await getLocationData(
                    latitude,
                    longitude
                );


            /*
                STEP 2:
                Convert raw data into
                ML-compatible features
            */

            const mlFeatures =
                prepareMLFeatures(
                    rawData
                );


            /*
                STEP 3:
                Send features to
                ML service
            */

            const result =
                await getLandslidePrediction(
                    mlFeatures
                );


            /*
                STEP 4:
                Save prediction
                in MongoDB
            */

            const predictionRecord =
                await PredictionRecord.create({

                    location: {

                        latitude,

                        longitude
                    },

                    inputs:
                        mlFeatures,

                    prediction:
                        result.data.prediction,

                    probabilities:
                        result.data.probabilities,

                    source:
                        "location"
                });


            /*
                STEP 5:
                Send final response
            */

            res.status(200).json({

                success: true,

                location: {

                    latitude,

                    longitude
                },

                rawData,

                mlFeatures,

                prediction:
                    result.data,

                recordId:
                    predictionRecord._id
            });
        }
    );


const getPredictionHistory =
    asyncHandler(
        async (req, res) => {

            const predictions =
                await PredictionRecord
                    .find()
                    .sort({
                        createdAt: -1
                    });

            res.status(200).json({

                success: true,

                count:
                    predictions.length,

                data:
                    predictions
            });
        }
    );


const getPredictionById =
    asyncHandler(
        async (req, res) => {

            const prediction =
                await PredictionRecord.findById(
                    req.params.id
                );

            if (!prediction) {

                const error =
                    new Error(
                        "Prediction record not found"
                    );

                error.statusCode =
                    404;

                throw error;
            }

            res.status(200).json({

                success: true,

                data:
                    prediction
            });
        }
    );


module.exports = {

    predictRisk,

    predictRiskByLocation,

    getPredictionHistory,

    getPredictionById
};