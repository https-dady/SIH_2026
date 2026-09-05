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


const {
    interpretRisk
} = require("../services/riskInterpretationService");


const {
    generateRiskInsights
} = require(
    "../services/riskInsightsService"
);


const {
    getMapRiskData
} = require(
    "../services/mapDataService"
);

const {
    getMapRiskZones
} = require(
    "../services/mapRiskZoneService"
);


const PredictionRecord =
    require("../models/PredictionRecord");


/*
    Manual ML prediction
*/

const predictRisk =
    asyncHandler(
        async (req, res) => {

            /*
                Get prediction
                from ML service
            */

            const result =
                await getLandslidePrediction(
                    req.body
                );


            /*
                Interpret
                ML prediction
            */

            const riskInterpretation =
                interpretRisk(
                    result.data
                );


            /*
                Generate
                risk insights

                Manual prediction already
                contains ML-compatible features,
                so req.body is used for both
                rawData and mlFeatures.
            */

            const riskInsights =
                generateRiskInsights(
                    req.body,
                    req.body,
                    riskInterpretation
                );


            /*
                Save complete prediction
                in MongoDB
            */

            const predictionRecord =
                await PredictionRecord.create({

                    inputs:
                        req.body,

                    prediction:
                        result.data.prediction,

                    probabilities:
                        result.data.probabilities,

                    riskInterpretation,

                    riskInsights,

                    source:
                        "manual"
                });


            /*
                Send response
            */

            res.status(200).json({

                success:
                    true,

                data:
                    result.data,

                riskInterpretation,

                riskInsights,

                recordId:
                    predictionRecord._id
            });
        }
    );


/*
    Location-based
    automatic prediction
*/

const predictRiskByLocation =
    asyncHandler(
        async (req, res) => {

            const requestStartTime =
                Date.now();


            const {
                latitude,
                longitude
            } = req.body;


            /*
                Validate latitude
            */

            if (
                typeof latitude !== "number" ||
                !Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90
            ) {

                const error =
                    new Error(
                        "Valid latitude is required"
                    );

                error.statusCode =
                    400;

                throw error;
            }


            /*
                Validate longitude
            */

            if (
                typeof longitude !== "number" ||
                !Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180
            ) {

                const error =
                    new Error(
                        "Valid longitude is required"
                    );

                error.statusCode =
                    400;

                throw error;
            }


            /*
                =================================
                STEP 1
                GET CENTER LOCATION DATA
                =================================
            */

           const locationDataStartTime =
    Date.now();

const mapZonesStartTime =
    Date.now();


const [
    rawData,
    mapRiskZones
] =
    await Promise.all([

        getLocationData(
            latitude,
            longitude
        ),

        getMapRiskZones(
            latitude,
            longitude
        )
    ]);


console.log(
    `CENTER LOCATION DATA TIME: ${
        Date.now() -
        locationDataStartTime
    } ms`
);


console.log(
    `MAP RISK ZONES TIME: ${
        Date.now() -
        mapZonesStartTime
    } ms`
);


            /*
                =================================
                STEP 2
                PREPARE ML FEATURES
                =================================
            */

            const featureStartTime =
                Date.now();


            const mlFeatures =
                prepareMLFeatures(
                    rawData
                );


            console.log(
                `FEATURE PREPARATION TIME: ${
                    Date.now() -
                    featureStartTime
                } ms`
            );


            /*
                =================================
                STEP 3
                CENTER ML PREDICTION
                =================================
            */

            const mlStartTime =
                Date.now();


            const result =
                await getLandslidePrediction(
                    mlFeatures
                );


            console.log(
                `CENTER ML TIME: ${
                    Date.now() -
                    mlStartTime
                } ms`
            );


            /*
                =================================
                STEP 4
                INTERPRET RISK
                =================================
            */

            const riskInterpretation =
                interpretRisk(
                    result.data
                );


            /*
                =================================
                STEP 5
                GENERATE INSIGHTS
                =================================
            */

            const insightsStartTime =
                Date.now();


            const riskInsights =
                generateRiskInsights(
                    rawData,
                    mlFeatures,
                    riskInterpretation
                );


            console.log(
                `RISK INSIGHTS TIME: ${
                    Date.now() -
                    insightsStartTime
                } ms`
            );


            /*
                =================================
                STEP 6
                CENTER MAP DATA
                =================================
            */

            const mapDataStartTime =
                Date.now();


            const mapData =
                getMapRiskData(
                    latitude,
                    longitude,
                    {
                        prediction:
                            result.data.prediction,

                        riskInterpretation
                    }
                );


            console.log(
                `CENTER MAP DATA TIME: ${
                    Date.now() -
                    mapDataStartTime
                } ms`
            );


            /*
                =================================
                STEP 7
                SURROUNDING MAP RISK ZONES
                =================================
            */

           
            /*
                =================================
                STEP 8
                DATABASE SAVE
                =================================
            */

            const databaseStartTime =
                Date.now();


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

                    riskInterpretation,

                    riskInsights,

                    source:
                        "location"
                });


            console.log(
                `DATABASE SAVE TIME: ${
                    Date.now() -
                    databaseStartTime
                } ms`
            );


            /*
                =================================
                TOTAL REQUEST TIME
                =================================
            */

            console.log(
                "================================="
            );


            console.log(
                `TOTAL API REQUEST TIME: ${
                    Date.now() -
                    requestStartTime
                } ms`
            );


            console.log(
                "================================="
            );


            /*
                Send response
            */

            res.status(200).json({

                success:
                    true,

                location: {

                    latitude,

                    longitude
                },

                rawData,

                mlFeatures,

                prediction:
                    result.data,

                riskInterpretation,

                riskInsights,

                mapData,

                mapRiskZones,

                recordId:
                    predictionRecord._id
            });
        }
    );


/*
    Get prediction history
*/

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

                success:
                    true,

                count:
                    predictions.length,

                data:
                    predictions
            });
        }
    );


/*
    Get prediction by ID
*/

const getPredictionById =
    asyncHandler(
        async (req, res) => {

            const prediction =
                await PredictionRecord.findById(
                    req.params.id
                );


            if (
                !prediction
            ) {

                const error =
                    new Error(
                        "Prediction record not found"
                    );

                error.statusCode =
                    404;

                throw error;
            }


            res.status(200).json({

                success:
                    true,

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