const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

const getLandslidePrediction = async (inputData) => {
    try {
        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            inputData
        );

        return response.data;
    } catch (error) {
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "ML service request failed";

        const mlError = new Error(
            typeof message === "string"
                ? message
                : "ML service request failed"
        );

        mlError.statusCode = error.response?.status || 503;

        throw mlError;
    }
};

module.exports = {
    getLandslidePrediction
};