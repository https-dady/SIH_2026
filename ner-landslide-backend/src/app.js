const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const riskRoutes = require("./routes/riskRoutes");


const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/risk", riskRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(errorMiddleware);

module.exports = app;