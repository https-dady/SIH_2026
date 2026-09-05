const mongoose = require("mongoose");


const predictionRecordSchema = new mongoose.Schema(
    {

        /*
            Location information

            Manual prediction me
            location optional hai.

            Location-based prediction me
            latitude and longitude save honge.
        */

        location: {

            latitude: {
                type: Number
            },

            longitude: {
                type: Number
            }
        },


        /*
            ML input features
        */

        inputs: {

            rainfall_mm: {
                type: Number,
                required: true
            },

            soil_moisture_pct: {
                type: Number,
                required: true
            },

            slope_deg: {
                type: Number,
                required: true
            },

            elevation_m: {
                type: Number,
                required: true
            },

            ndvi: {
                type: Number,
                required: true
            },

            distance_to_road_m: {
                type: Number,
                required: true
            },

            lithology_factor: {
                type: Number,
                required: true
            },

            drainage_density_km_per_km2: {
                type: Number,
                required: true
            },

            historical_landslide: {
                type: Number,
                required: true,
                enum: [0, 1]
            }
        },


        /*
            Final ML prediction
        */

        prediction: {

            type: String,

            required: true,

            enum: [
                "Low",
                "Medium",
                "High"
            ]
        },


        /*
            ML probabilities
        */

        probabilities: {

            Low: {
                type: Number,
                default: 0
            },

            Medium: {
                type: Number,
                default: 0
            },

            High: {
                type: Number,
                default: 0
            }
        },


        /*
            Complete interpreted
            risk result
        */

        riskInterpretation: {

            riskLevel: {
                type: String
            },

            riskScore: {
                type: Number
            },

            riskPercentage: {
                type: Number
            },

            explanation: {
                type: String
            },

            probabilities: {

                Low: {
                    type: Number,
                    default: 0
                },

                Medium: {
                    type: Number,
                    default: 0
                },

                High: {
                    type: Number,
                    default: 0
                }
            }
        },


        /*
            Generated risk insights.

            Mixed structure allows
            future insight changes
            without changing schema.
        */

        riskInsights: {

            type:
                mongoose.Schema.Types.Mixed,

            default:
                null
        },


        /*
            Prediction source
        */

        source: {

            type: String,

            default:
                "manual"
        }
    },

    {
        timestamps: true
    }
);


/*
    IMPORTANT:

    mongoose.model() returns the
    actual Mongoose model.

    This model has functions like:

    PredictionRecord.create()
    PredictionRecord.find()
    PredictionRecord.findById()
*/

const PredictionRecord =
    mongoose.models.PredictionRecord ||
    mongoose.model(
        "PredictionRecord",
        predictionRecordSchema
    );


/*
    IMPORTANT:

    Export the model directly.

    Controller uses:

    const PredictionRecord =
        require("../models/PredictionRecord");
*/

module.exports =
    PredictionRecord;