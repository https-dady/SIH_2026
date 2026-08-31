const axios = require("axios");

const BaseProvider = require("../baseProvider");


class RainfallProvider extends BaseProvider {
    async getData(latitude, longitude) {
        try {
            const response = await axios.get(
                "https://api.open-meteo.com/v1/forecast",
                {
                    params: {
                        latitude,
                        longitude,
                        hourly: "precipitation",
                        past_days: 1,
                        forecast_days: 1
                    }
                }
            );

            const precipitation =
                response.data.hourly?.precipitation;

            const time =
                response.data.hourly?.time;

            if (
                !Array.isArray(precipitation) ||
                !Array.isArray(time) ||
                precipitation.length === 0
            ) {
                throw new Error(
                    "Invalid rainfall data received"
                );
            }

            /*
                Open-Meteo se hourly historical/current
                precipitation data milta hai.

                Current time ke previous 24 hourly
                observations ko sum karenge.
            */

            const now = new Date();

            let rainfallMm = 0;
            let validHours = 0;

            for (
                let i = 0;
                i < time.length;
                i++
            ) {
                const dataTime =
                    new Date(time[i]);

                const differenceMs =
                    now - dataTime;

                const differenceHours =
                    differenceMs /
                    (1000 * 60 * 60);

                if (
                    differenceHours > 0 &&
                    differenceHours <= 24
                ) {
                    rainfallMm +=
                        Number(precipitation[i]) || 0;

                    validHours++;
                }
            }

            if (validHours === 0) {
                throw new Error(
                    "No rainfall data available for the last 24 hours"
                );
            }

            return {
                rainfall_mm:
                    Number(
                        rainfallMm.toFixed(2)
                    )
            };

        } catch (error) {
            throw new Error(
                `Failed to fetch rainfall data: ${error.message}`
            );
        }
    }
}


module.exports = RainfallProvider;