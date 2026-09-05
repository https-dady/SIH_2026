const axios = require("axios");

const BaseProvider = require("../baseProvider");


class VegetationProvider extends BaseProvider {


    /*
        Cache Copernicus access token
        so every prediction request
        does not request a new token.
    */

    static accessToken = null;

    static tokenExpiresAt = 0;

    static tokenRequestPromise = null;


    /*
    Cache NDVI results.

    Satellite vegetation data does not
    change frequently, so short-term
    caching avoids repeated expensive
    Copernicus API requests.
*/

    static ndviCache =
        new Map();


    static NDVI_CACHE_DURATION =
        10 * 60 * 1000;

    async getAccessToken() {

        if (

            VegetationProvider.accessToken &&

            Date.now() <
            VegetationProvider.tokenExpiresAt

        ) {

            return (
                VegetationProvider.accessToken
            );
        }


        /*
            If another request is already
            fetching a token, wait for
            the same request instead of
            creating another token request.
        */

        if (

            VegetationProvider.tokenRequestPromise

        ) {

            return (
                await VegetationProvider
                    .tokenRequestPromise
            );
        }


        VegetationProvider.tokenRequestPromise =

            axios.post(

                "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",

                new URLSearchParams({

                    grant_type:
                        "client_credentials",

                    client_id:
                        process.env.COPERNICUS_CLIENT_ID,

                    client_secret:
                        process.env.COPERNICUS_CLIENT_SECRET

                }),

                {

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded"

                    },

                    timeout:
                        15000

                }

            )

                .then(

                    (
                        response
                    ) => {

                        const accessToken =
                            response.data.access_token;


                        const expiresIn =
                            response.data.expires_in;


                        if (

                            !accessToken

                        ) {

                            throw new Error(

                                "Failed to receive Copernicus access token"

                            );
                        }


                        const expiryMilliseconds =

                            (

                                typeof expiresIn ===
                                    "number"

                                    ? expiresIn

                                    : 600

                            )

                            * 1000;


                        VegetationProvider.accessToken =
                            accessToken;


                        VegetationProvider.tokenExpiresAt =

                            Date.now() +

                            expiryMilliseconds -

                            60000;


                        return accessToken;

                    }

                )

                .finally(

                    () => {

                        VegetationProvider.tokenRequestPromise =
                            null;

                    }

                );


        return (

            await VegetationProvider
                .tokenRequestPromise

        );

        
    }

  /*
        Generate cache key based on
        nearby geographic grid.

        Nearby coordinates inside the
        same grid share the same NDVI
        cache entry.
    */

    getCacheKey(
        latitude,
        longitude
    ) {

        const gridSize =
            0.01;


        const roundedLatitude =
            Math.round(
                latitude / gridSize
            ) * gridSize;


        const roundedLongitude =
            Math.round(
                longitude / gridSize
            ) * gridSize;


        return (
            `${roundedLatitude.toFixed(2)},` +
            `${roundedLongitude.toFixed(2)}`
        );
    }



    /*
        Get recent satellite date range.

        Reduced from 30 days to 14 days
        for faster statistics processing.
    */

    getDateRange() {

        const endDate =
            new Date();


        const startDate =
            new Date();


        startDate.setDate(
            startDate.getDate() - 14
        );


        return {

            from:
                startDate.toISOString(),

            to:
                endDate.toISOString()
        };
    }


    /*
        Fetch NDVI statistics.

        strictCloudFiltering:
        true  -> exclude cloud classes
        false -> use available valid pixels
                 as fallback.
    */

    async fetchNdviStatistics(

        accessToken,

        latitude,

        longitude,

        dateRange,

        strictCloudFiltering = true

    ) {


        /*
            Small area around location.

            Area-based NDVI is more
            stable than a single pixel.
        */

        const offset =
            0.002;


        const bbox =
            [

                longitude - offset,

                latitude - offset,

                longitude + offset,

                latitude + offset
            ];


        /*
            Strict filtering removes
            cloud-related SCL classes.

            Fallback mode accepts all
            valid land pixels so the
            API does not unnecessarily
            fail when no completely
            cloud-free scene exists.
        */

        const invalidSclCheck =
            strictCloudFiltering

                ? `

                    const invalidSclClasses = [
                        0,
                        1,
                        3,
                        8,
                        9,
                        10,
                        11
                    ];

                    const isInvalid =
                        invalidSclClasses.includes(
                            sample.SCL
                        );

                    if (
                        sample.dataMask === 0 ||
                        isInvalid ||
                        (
                            sample.B08 +
                            sample.B04
                        ) === 0
                    ) {
                        return {
                            ndvi: [0],
                            dataMask: [0]
                        };
                    }

                `

                : `

                    if (
                        sample.dataMask === 0 ||
                        (
                            sample.B08 +
                            sample.B04
                        ) === 0
                    ) {
                        return {
                            ndvi: [0],
                            dataMask: [0]
                        };
                    }

                `;


        const evalscript =
            `
//VERSION=3

function setup() {

    return {

        input: [
            {
                bands: [
                    "B04",
                    "B08",
                    "SCL",
                    "dataMask"
                ]
            }
        ],

        output: [
            {
                id: "ndvi",
                bands: 1,
                sampleType: "FLOAT32"
            },

            {
                id: "dataMask",
                bands: 1
            }
        ]
    };
}


function evaluatePixel(
    sample
) {

    ${invalidSclCheck}

    const ndvi =
        (
            sample.B08 -
            sample.B04
        ) /
        (
            sample.B08 +
            sample.B04
        );


    return {

        ndvi: [
            ndvi
        ],

        dataMask: [
            1
        ]
    };
}
            `;


        const requestBody =
        {

            input: {

                bounds: {

                    bbox,

                    properties: {

                        crs:
                            "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                    }
                },


                data: [

                    {

                        type:
                            "sentinel-2-l2a",

                        dataFilter: {

                            mosaickingOrder:
                                "leastCC"
                        }
                    }
                ]
            },


            aggregation: {

                timeRange: {

                    from:
                        dateRange.from,

                    to:
                        dateRange.to
                },


                aggregationInterval: {

                    of:
                        "P14D"
                },


                evalscript,


                /*
                    Slightly larger
                    resolution reduces
                    processing time.
                */

                resx:
                    20,

                resy:
                    20
            }
        };


        const response =
            await axios.post(

                "https://sh.dataspace.copernicus.eu/statistics/v1",

                requestBody,

                {

                    headers: {

                        Authorization:
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    timeout:
                        20000
                }
            );


        return (
            response.data?.data ||
            []
        );
    }


    /*
        Extract valid NDVI
        from statistics response.
    */

    extractNdvi(
        statisticsData
    ) {

        if (

            !Array.isArray(
                statisticsData
            ) ||

            statisticsData.length === 0

        ) {

            return null;
        }


        for (

            let i =
                statisticsData.length - 1;

            i >= 0;

            i--

        ) {

            const intervalData =
                statisticsData[i];


            const bandStats =

                intervalData
                    ?.outputs
                    ?.ndvi
                    ?.bands
                    ?.B0
                    ?.stats;


            if (

                bandStats &&

                typeof bandStats.mean ===
                "number" &&

                bandStats.sampleCount >
                bandStats.noDataCount

            ) {

                return (
                    bandStats.mean
                );
            }
        }


        return null;
    }


    /*
        Main provider method
    */

    async getData(
        latitude,
        longitude
    ) {

        try {

            /*
    Generate cache key
    for this location
*/

const cacheKey =
    this.getCacheKey(
        latitude,
        longitude
    );


/*
    Check NDVI cache
*/

const cachedData =
    VegetationProvider
        .ndviCache
        .get(
            cacheKey
        );


if (
    cachedData &&
    (
        Date.now() -
        cachedData.timestamp
    ) <
    VegetationProvider
        .NDVI_CACHE_DURATION
) {

    return {
        ndvi:
            cachedData.ndvi
    };
}

            const accessToken =
                await this.getAccessToken();


            const dateRange =
                this.getDateRange();


            /*
                STEP 1

                Try strict cloud-free
                NDVI first.
            */

            const statisticsData =
                await this.fetchNdviStatistics(

                    accessToken,

                    latitude,

                    longitude,

                    dateRange,

                    false
                );


            const ndvi =
                this.extractNdvi(
                    statisticsData
                );


            /*
                If satellite service still
                returns no valid data,
                fail clearly.
            */

            if (

                typeof ndvi !== "number" ||

                Number.isNaN(
                    ndvi
                )

            ) {

                throw new Error(
                    "No valid NDVI data available"
                );
            }


            /*
                NDVI theoretical range
                validation.
            */

            if (

                ndvi < -1 ||

                ndvi > 1

            ) {

                throw new Error(
                    "NDVI value outside valid range"
                );
            }


            const formattedNdvi =
    Number(
        ndvi.toFixed(
            4
        )
    );


/*
    Save NDVI result
    in cache
*/

VegetationProvider
    .ndviCache
    .set(
        cacheKey,
        {
            ndvi:
                formattedNdvi,

            timestamp:
                Date.now()
        }
    );


return {

    ndvi:
        formattedNdvi
};


        } catch (
        error
        ) {

            throw new Error(

                `Failed to fetch vegetation data: ${error.response?.data
                    ? JSON.stringify(
                        error.response.data
                    )
                    : error.message
                }`
            );
        }
    }
}


module.exports =
    VegetationProvider;