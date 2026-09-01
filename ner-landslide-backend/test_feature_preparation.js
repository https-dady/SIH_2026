const {
    getLocationData
} = require(
    "./src/services/dataAggregatorService"
);


const {
    prepareMLFeatures
} = require(
    "./src/services/featurePreparationService"
);


const testFeaturePreparation =
    async () => {

        try {

            console.log(
                "Fetching raw location data..."
            );


            const rawData =
                await getLocationData(
                    26.1445,
                    91.7362
                );


            console.log(
                "\nRAW DATA:"
            );

            console.log(
                JSON.stringify(
                    rawData,
                    null,
                    2
                )
            );


            const mlFeatures =
                prepareMLFeatures(
                    rawData
                );


            console.log(
                "\nML FEATURES:"
            );

            console.log(
                JSON.stringify(
                    mlFeatures,
                    null,
                    2
                )
            );

        } catch (
            error
        ) {

            console.error(
                "\nTEST ERROR:",
                error.message
            );

        }

    };


testFeaturePreparation();