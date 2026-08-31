const mongoose = require("mongoose");

const predictionRecordSchema = new mongoose.Schema(
    {
        location: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },

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

        prediction: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"]
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
        },

        source: {
            type: String,
            default: "manual"
        }
    },
    {
        timestamps: true
    }
);

const PredictionRecord = mongoose.model(
    "PredictionRecord",
    predictionRecordSchema
);

module.exports = PredictionRecord;