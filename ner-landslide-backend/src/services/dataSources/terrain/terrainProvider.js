const axios = require("axios");

const BaseProvider = require("../baseProvider");


class TerrainProvider extends BaseProvider {

    async getElevation(latitude, longitude) {
        const response = await axios.get(
            "https://api.open-meteo.com/v1/elevation",
            {
                params: {
                    latitude,
                    longitude
                }
            }
        );

        const elevation = response.data.elevation?.[0];

        if (typeof elevation !== "number") {
            throw new Error("Invalid elevation data received");
        }

        return elevation;
    }


    calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadiusKm = 6371;

        const dLat =
            ((lat2 - lat1) * Math.PI) / 180;

        const dLon =
            ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadiusKm * c;
    }


    async calculateDrainageDensity(
    latitude,
    longitude
) {
    const radiusMeters = 1000;

    const overpassQuery = `
        [out:json][timeout:25];
        way
        ["waterway"~"^(stream|river|ditch|drain)$"]
        (around:${radiusMeters},${latitude},${longitude});
        out geom;
    `;

    const requestBody =
        new URLSearchParams({
            data: overpassQuery
        });

    const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        requestBody,
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",

                "Accept":
                    "application/json",

                "User-Agent":
                    "NER-Landslide-Risk-Backend/1.0"
            },

            timeout: 60000
        }
    );

    const elements =
        response.data.elements || [];

    let totalWaterwayLengthKm = 0;

    for (const element of elements) {
        const geometry = element.geometry;

        if (
            !geometry ||
            geometry.length < 2
        ) {
            continue;
        }

        for (
            let i = 0;
            i < geometry.length - 1;
            i++
        ) {
            const point1 = geometry[i];

            const point2 =
                geometry[i + 1];

            totalWaterwayLengthKm +=
                this.calculateDistance(
                    point1.lat,
                    point1.lon,
                    point2.lat,
                    point2.lon
                );
        }
    }

    const radiusKm =
        radiusMeters / 1000;

    const areaKm2 =
        Math.PI *
        Math.pow(radiusKm, 2);

    const drainageDensity =
        totalWaterwayLengthKm /
        areaKm2;

    return Number(
        drainageDensity.toFixed(4)
    );
}


    async getData(latitude, longitude) {
        try {
            const offset = 0.001;

            const [
                centerElevation,
                northElevation,
                southElevation,
                eastElevation,
                westElevation,
                drainageDensity
            ] = await Promise.all([
                this.getElevation(
                    latitude,
                    longitude
                ),

                this.getElevation(
                    latitude + offset,
                    longitude
                ),

                this.getElevation(
                    latitude - offset,
                    longitude
                ),

                this.getElevation(
                    latitude,
                    longitude + offset
                ),

                this.getElevation(
                    latitude,
                    longitude - offset
                ),

                this.calculateDrainageDensity(
                    latitude,
                    longitude
                )
            ]);

            const northSouthDistance =
                offset * 111320;

            const eastWestDistance =
                offset *
                111320 *
                Math.cos(
                    (latitude * Math.PI) / 180
                );

            const northSouthGradient =
                (northElevation -
                    southElevation) /
                (2 * northSouthDistance);

            const eastWestGradient =
                (eastElevation -
                    westElevation) /
                (2 * eastWestDistance);

            const gradientMagnitude =
                Math.sqrt(
                    Math.pow(
                        northSouthGradient,
                        2
                    ) +
                    Math.pow(
                        eastWestGradient,
                        2
                    )
                );

            const slopeDeg =
                Math.atan(
                    gradientMagnitude
                ) *
                (180 / Math.PI);

            return {
                elevation_m:
                    centerElevation,

                slope_deg:
                    Number(
                        slopeDeg.toFixed(2)
                    ),

                drainage_density_km_per_km2:
                    drainageDensity
            };

        } catch (error) {
            throw new Error(
                `Failed to fetch terrain data: ${error.message}`
            );
        }
    }
}


module.exports = TerrainProvider;