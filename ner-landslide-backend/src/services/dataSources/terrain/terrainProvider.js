const axios = require("axios");

const BaseProvider =
    require("../baseProvider");


class TerrainProvider
    extends BaseProvider {


    constructor() {

        super();


        /*
            Cache drainage density
            for recently requested locations
        */

        this.drainageCache =
            new Map();


        /*
            Prevent duplicate simultaneous
            requests for same location
        */

        this.drainageRequests =
            new Map();


        /*
            Cache duration

            10 minutes
        */

        this.cacheTTL =
            10 * 60 * 1000;
    }


    /*
        Get multiple elevation points
        in a single API request
    */

    async getElevations(
        coordinates
    ) {

        const latitudes =
            coordinates
                .map(
                    (point) =>
                        point.latitude
                )
                .join(",");


        const longitudes =
            coordinates
                .map(
                    (point) =>
                        point.longitude
                )
                .join(",");


        const response =
            await axios.get(
                "https://api.open-meteo.com/v1/elevation",
                {
                    params: {

                        latitude:
                            latitudes,

                        longitude:
                            longitudes
                    },

                    timeout:
                        5000
                }
            );


        const elevations =
            response.data.elevation;


        if (
            !Array.isArray(
                elevations
            ) ||
            elevations.length !==
                coordinates.length
        ) {

            throw new Error(
                "Invalid elevation data received"
            );
        }


        return elevations;
    }


    /*
        Calculate distance
        between two coordinates
    */

    calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const earthRadiusKm =
            6371;


        const dLat =
            (
                (lat2 - lat1) *
                Math.PI
            ) /
            180;


        const dLon =
            (
                (lon2 - lon1) *
                Math.PI
            ) /
            180;


        const a =

            Math.sin(
                dLat / 2
            ) *

            Math.sin(
                dLat / 2
            )

            +

            Math.cos(
                (
                    lat1 *
                    Math.PI
                ) / 180
            )

            *

            Math.cos(
                (
                    lat2 *
                    Math.PI
                ) / 180
            )

            *

            Math.sin(
                dLon / 2
            )

            *

            Math.sin(
                dLon / 2
            );


        const c =

            2 *

            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(
                    1 - a
                )
            );


        return (
            earthRadiusKm *
            c
        );
    }


    /*
        Create cache key

        Rounded to 3 decimal places

        Approximately 100 meter
        location grouping
    */

    getDrainageCacheKey(
        latitude,
        longitude
    ) {

        return (

            `${latitude.toFixed(3)},` +

            `${longitude.toFixed(3)}`
        );
    }


    /*
        Calculate drainage density
    */

    async calculateDrainageDensity(
        latitude,
        longitude
    ) {

        const cacheKey =
            this.getDrainageCacheKey(
                latitude,
                longitude
            );


        /*
            STEP 1:

            Check cache
        */

        const cachedData =
            this.drainageCache.get(
                cacheKey
            );


        if (
            cachedData &&
            (
                Date.now() -
                cachedData.timestamp
            ) <
            this.cacheTTL
        ) {

            return (
                cachedData.value
            );
        }


        /*
            STEP 2:

            If same location request
            is already running,
            reuse that request
        */

        if (
            this.drainageRequests.has(
                cacheKey
            )
        ) {

            return (
                this.drainageRequests.get(
                    cacheKey
                )
            );
        }


        /*
            STEP 3:

            Create request promise
        */

        const drainagePromise =

            this.fetchAndCalculateDrainage(
                latitude,
                longitude,
                cacheKey
            );


        this.drainageRequests.set(
            cacheKey,
            drainagePromise
        );


        try {

            return await (
                drainagePromise
            );

        } finally {

            /*
                Remove completed request
                from active request map
            */

            this.drainageRequests.delete(
                cacheKey
            );
        }
    }


    /*
        Fetch drainage data
        and calculate density
    */

    async fetchAndCalculateDrainage(
        latitude,
        longitude,
        cacheKey
    ) {

        try {

            const radiusMeters =
                1000;


            const overpassQuery = `

                [out:json][timeout:8];

                way
                ["waterway"~"^(stream|river|ditch|drain)$"]
                (
                    around:
                    ${radiusMeters},
                    ${latitude},
                    ${longitude}
                );

                out geom;

            `;


            const requestBody =
                new URLSearchParams(
                    {

                        data:
                            overpassQuery
                    }
                );


            /*
                IMPORTANT:

                Do not allow Overpass
                to block complete prediction
                for 12+ seconds
            */

            const response =
                await axios.post(

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


                        /*
                            Hard client timeout

                            Fast fallback is better
                            than waiting 12 seconds
                            for map points.
                        */

                        timeout:
                            1000
                    }
                );


            const elements =
                response.data.elements ||
                [];


            let totalWaterwayLengthKm =
                0;


            for (
                const element
                of elements
            ) {

                const geometry =
                    element.geometry;


                if (
                    !geometry ||
                    geometry.length < 2
                ) {

                    continue;
                }


                for (
                    let i = 0;

                    i <
                    geometry.length - 1;

                    i++
                ) {

                    const point1 =
                        geometry[i];


                    const point2 =
                        geometry[
                            i + 1
                        ];


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
                radiusMeters /
                1000;


            const areaKm2 =

                Math.PI *

                Math.pow(
                    radiusKm,
                    2
                );


            const drainageDensity =

                totalWaterwayLengthKm /

                areaKm2;


            const result =
                Number(
                    drainageDensity.toFixed(
                        4
                    )
                );


            /*
                Save successful result
                in cache
            */

            this.drainageCache.set(

                cacheKey,

                {

                    value:
                        result,

                    timestamp:
                        Date.now()
                }
            );


            return result;

        } catch (
            error
        ) {

            console.log(

                "Drainage API unavailable:",

                error.message
            );


            /*
                Cache fallback briefly.

                This prevents multiple
                repeated requests to an
                already unavailable API.
            */

            const fallbackValue =
                0;


            this.drainageCache.set(

                cacheKey,

                {

                    value:
                        fallbackValue,

                    timestamp:
                        Date.now()
                }
            );


            return (
                fallbackValue
            );
        }
    }


    /*
        Get complete terrain data
    */

    async getData(
        latitude,
        longitude
    ) {

        try {

            const offset =
                0.001;


            const coordinates =

                [

                    {

                        latitude,

                        longitude
                    },

                    {

                        latitude:
                            latitude +
                            offset,

                        longitude
                    },

                    {

                        latitude:
                            latitude -
                            offset,

                        longitude
                    },

                    {

                        latitude,

                        longitude:
                            longitude +
                            offset
                    },

                    {

                        latitude,

                        longitude:
                            longitude -
                            offset
                    }
                ];


            /*
                Elevation and drainage
                run in parallel
            */

            const [

                elevations,

                drainageDensity

            ] =

                await Promise.all(

                    [

                        this.getElevations(
                            coordinates
                        ),

                        this.calculateDrainageDensity(
                            latitude,
                            longitude
                        )
                    ]
                );


            const [

                centerElevation,

                northElevation,

                southElevation,

                eastElevation,

                westElevation

            ] = elevations;


            const northSouthDistance =

                offset *
                111320;


            const eastWestDistance =

                offset *

                111320 *

                Math.cos(

                    (
                        latitude *
                        Math.PI
                    ) /
                    180
                );


            const northSouthGradient =

                (
                    northElevation -
                    southElevation
                ) /

                (
                    2 *
                    northSouthDistance
                );


            const eastWestGradient =

                (
                    eastElevation -
                    westElevation
                ) /

                (
                    2 *
                    eastWestDistance
                );


            const gradientMagnitude =

                Math.sqrt(

                    Math.pow(
                        northSouthGradient,
                        2
                    )

                    +

                    Math.pow(
                        eastWestGradient,
                        2
                    )
                );


            const slopeDeg =

                Math.atan(
                    gradientMagnitude
                )

                *

                (
                    180 /
                    Math.PI
                );


            return {

                elevation_m:
                    centerElevation,


                slope_deg:

                    Number(

                        slopeDeg.toFixed(
                            2
                        )
                    ),


                drainage_density_km_per_km2:
                    drainageDensity
            };

        } catch (
            error
        ) {

            throw new Error(

                `Failed to fetch terrain data: ${error.message}`
            );
        }
    }
}


module.exports =
    TerrainProvider;