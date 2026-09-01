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
                Save prediction
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

                Send features
                to ML service
            */

            const result = 
                await getLandslidePrediction( 
                    mlFeatures 
                ); 


            /*
                STEP 4:

                Interpret
                ML result
            */

            const riskInterpretation = 
                interpretRisk( 
                    result.data 
                ); 


            /*
                STEP 5:

                Generate
                risk insights
            */

            const riskInsights = 
                generateRiskInsights( 
                    rawData,
                    mlFeatures,
                    riskInterpretation 
                ); 


            /*
                STEP 6:

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
                STEP 7:

                Send final response
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