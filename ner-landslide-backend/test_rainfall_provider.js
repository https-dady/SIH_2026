const RainfallProvider = require(
    "./src/services/dataSources/rainfall/rainfallProvider"
);


const testRainfallProvider = async () => {
    try {
        const rainfallProvider =
            new RainfallProvider();

        const result =
            await rainfallProvider.getData(
                26.1445,
                91.7362
            );

        console.log("Rainfall Data:");
        console.log(result);

    } catch (error) {
        console.error("Test Failed:");
        console.error(error.message);
    }
};


testRainfallProvider();