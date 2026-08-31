const axios = require("axios");

const BaseProvider = require("../baseProvider");


class VegetationProvider extends BaseProvider {

    async getAccessToken() {
        const response = await axios.post(
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
                }
            }
        );

        const accessToken =
            response.data.access_token;

        if (!accessToken) {
            throw new Error(
                "Failed to receive Copernicus access token"
            );
        }

        return accessToken;
    }


    getDateRange() {
        const endDate =
            new Date();

        const startDate =
            new Date();

        /*
            Last 30 days satellite data.
        */

        startDate.setDate(
            startDate.getDate() - 30
        );

        return {
            from:
                startDate.toISOString(),

            to:
                endDate.toISOString()
        };
    }


    async getData(
        latitude,
        longitude
    ) {
        try {

            const accessToken =
                await this.getAccessToken();

            const dateRange =
                this.getDateRange();


            /*
                Small area around location.

                Area-based average NDVI is more
                stable than a single pixel.
            */

            const offset = 0.002;

            const bbox = [
                longitude - offset,
                latitude - offset,

                longitude + offset,
                latitude + offset
            ];


            const evalscript = `
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

                    /*
                        SCL classes excluded:

                        0 = No data
                        1 = Saturated / defective
                        3 = Cloud shadow
                        8 = Cloud medium probability
                        9 = Cloud high probability
                        10 = Thin cirrus
                        11 = Snow / ice
                    */

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


                    /*
                        Exclude:

                        - No data
                        - Invalid scene classes
                        - Invalid band denominator
                    */

                    if (
                        sample.dataMask === 0 ||
                        isInvalid ||
                        (
                            sample.B08 +
                            sample.B04
                        ) === 0
                    ) {

                        return {

                            ndvi: [
                                0
                            ],

                            dataMask: [
                                0
                            ]
                        };
                    }


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

                        /*
                            Valid pixel.
                        */

                        dataMask: [
                            1
                        ]
                    };
                }
            `;


            const requestBody = {

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

                                /*
                                    Choose a recent
                                    least-cloudy scene.
                                */

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


                    /*
                        Single aggregation
                        for the full period.
                    */

                    aggregationInterval: {

                        of:
                            "P30D"
                    },


                    evalscript,


                    /*
                        Sentinel-2 resolution.
                    */

                    resx: 10,

                    resy: 10
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
                        }
                    }
                );


            const statisticsData =
                response.data?.data;


            if (
                !Array.isArray(
                    statisticsData
                ) ||
                statisticsData.length === 0
            ) {

                throw new Error(
                    "No NDVI statistics received"
                );
            }


            let ndvi = null;


            /*
                Find the latest interval
                containing valid pixels.
            */

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

                    ndvi =
                        bandStats.mean;

                    break;
                }
            }


            if (
                typeof ndvi !== "number" ||
                Number.isNaN(ndvi)
            ) {

                throw new Error(
                    "No valid cloud-free NDVI data available"
                );
            }


            /*
                NDVI theoretical range:
                -1 to +1

                Safety validation.
            */

            if (
                ndvi < -1 ||
                ndvi > 1
            ) {

                throw new Error(
                    "NDVI value outside valid range"
                );
            }


            return {

                ndvi:
                    Number(
                        ndvi.toFixed(4)
                    )
            };

        } catch (error) {

            throw new Error(

                `Failed to fetch vegetation data: ${
                    error.response?.data
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