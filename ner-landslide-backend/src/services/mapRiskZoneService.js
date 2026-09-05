const {
    getLocationData
} = require(
    "./dataAggregatorService"
);


const {
    prepareMLFeatures
} = require(
    "./featurePreparationService"
);


const {
    getLandslidePrediction
} = require(
    "./mlService"
);


const {
    interpretRisk
} = require(
    "./riskInterpretationService"
);


/*
    Generate surrounding
    coordinates around
    selected location
*/

const generateSurroundingPoints =
    (
        latitude,
        longitude,
        distance = 0.05
    ) => {

        return [

            {
                latitude:
                    latitude + distance,

                longitude
            },

            {
                latitude:
                    latitude - distance,

                longitude
            },

            {
                latitude,

                longitude:
                    longitude + distance
            },

            {
                latitude,

                longitude:
                    longitude - distance
            }
        ];
    };


/*
    Get actual risk data
    for a single location
*/

const getPointRisk =
    async (
        latitude,
        longitude
    ) => {

        /*
            STEP 1:

            Get location
            raw data
        */

        const rawData =
            await getLocationData(
                latitude,
                longitude
            );


        /*
            STEP 2:

            Prepare ML
            features
        */

        const mlFeatures =
            prepareMLFeatures(
                rawData
            );


        /*
            STEP 3:

            Get ML
            prediction
        */

        const result =
            await getLandslidePrediction(
                mlFeatures
            );


        /*
            STEP 4:

            Interpret
            prediction
        */

        const riskInterpretation =
            interpretRisk(
                result.data
            );


        /*
            Return clean
            map-compatible
            risk point
        */

        return {

            location: {

                latitude,

                longitude
            },

            risk: {

                prediction:
                    result.data.prediction,

                riskLevel:
                    riskInterpretation.riskLevel,

                riskScore:
                    riskInterpretation.riskScore,

                riskPercentage:
                    riskInterpretation.riskPercentage
            }
        };
    };


/*
    Prepare surrounding
    map risk zones

    Each surrounding point
    receives actual ML-based
    risk data.
*/

const getMapRiskZones =
    async (
        latitude,
        longitude
    ) => {

        const surroundingPoints =
            generateSurroundingPoints(
                latitude,
                longitude
            );


        const points =
            await Promise.all(

                surroundingPoints.map(
                    async (
                        point
                    ) => {

                        return await getPointRisk(
                            point.latitude,
                            point.longitude
                        );

                    }
                )
            );


        return {

            center: {

                latitude,

                longitude
            },

            points
        };
    };


module.exports = {

    generateSurroundingPoints,

    getPointRisk,

    getMapRiskZones
};