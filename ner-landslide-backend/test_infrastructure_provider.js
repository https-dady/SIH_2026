const InfrastructureProvider = require(
    "./src/services/dataSources/infrastructure/infrastructureProvider"
);


const testInfrastructureProvider = async () => {
    try {
        const infrastructureProvider =
            new InfrastructureProvider();

        const result =
            await infrastructureProvider.getData(
                26.1445,
                91.7362
            );

        console.log(
            "Infrastructure Data:"
        );

        console.log(result);

    } catch (error) {
        console.error(
            "Test Failed:"
        );

        console.error(
            error.message
        );
    }
};


testInfrastructureProvider();