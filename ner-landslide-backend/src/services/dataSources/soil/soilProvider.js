const axios = require("axios");

const BaseProvider = require("../baseProvider");


class SoilProvider extends BaseProvider {

    async getApiSoilMoisture(
        latitude,
        longitude
    ) {
        const response = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {
                    latitude,
                    longitude,
                    hourly: "soil_moisture_0_to_1cm",
                    past_days: 1,
                    forecast_days: 1
                }
            }
        );

        const soilMoisture =
            response.data.hourly
                ?.soil_moisture_0_to_1cm;

        const time =
            response.data.hourly?.time;

        if (
            !Array.isArray(soilMoisture) ||
            !Array.isArray(time) ||
            soilMoisture.length === 0
        ) {
            throw new Error(
                "Invalid soil moisture data received"
            );
        }

        /*
            Current time ke nearest available
            soil moisture reading find karenge.
        */

        const now = new Date();

        let closestIndex = -1;
        let smallestDifference = Infinity;

        for (
            let i = 0;
            i < time.length;
            i++
        ) {
            const dataTime =
                new Date(time[i]);

            const difference =
                Math.abs(
                    now.getTime() -
                    dataTime.getTime()
                );

            if (
                difference <
                smallestDifference
            ) {
                smallestDifference =
                    difference;

                closestIndex = i;
            }
        }

        if (closestIndex === -1) {
            throw new Error(
                "No current soil moisture data available"
            );
        }

        const latestValue =
            soilMoisture[closestIndex];

        if (
            typeof latestValue !== "number"
        ) {
            throw new Error(
                "Invalid soil moisture value received"
            );
        }

        /*
            Open-Meteo value:
            volumetric water content (m³/m³)

            Convert to percentage.
        */

        const soilMoisturePct =
            latestValue * 100;

        return Number(
            soilMoisturePct.toFixed(2)
        );
    }


    async getData(
        latitude,
        longitude,
        deviceReading = null
    ) {
        try {

            /*
                PRIORITY 1:
                External hardware device
            */

            if (
                deviceReading !== null &&
                typeof deviceReading === "number"
            ) {
                return {
                    soil_moisture_pct:
                        Number(
                            deviceReading.toFixed(2)
                        ),

                    source:
                        "hardware"
                };
            }


            /*
                PRIORITY 2:
                API fallback
            */

            const soilMoisturePct =
                await this.getApiSoilMoisture(
                    latitude,
                    longitude
                );

            return {
                soil_moisture_pct:
                    soilMoisturePct,

                source:
                    "api"
            };

        } catch (error) {
            throw new Error(
                `Failed to fetch soil moisture data: ${error.message}`
            );
        }
    }
}


module.exports = SoilProvider;