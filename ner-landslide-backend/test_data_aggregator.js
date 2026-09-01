require("dotenv").config();

const {
    getLocationData
} = require("./src/services/dataAggregatorService");


const testDataAggregator = async () => {
    try {
        console.log(
            "Fetching aggregated location data..."
        );

        const data =
            await getLocationData(
                26.1445,
                91.7362
            );

        console.log(
            "Aggregated Data:"
        );

        console.log(
            JSON.stringify(
                data,
                null,
                2
            )
        );

    } catch (error) {
        console.error(
            "Aggregation Error:",
            error.message
        );
    }
};


testDataAggregator();