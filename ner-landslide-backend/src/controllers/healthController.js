const asyncHandler = require("../utils/asyncHandler");

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "NER Landslide Backend is running",
        database: "connected"
    });
});

module.exports = {
    healthCheck
};