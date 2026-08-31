require("dotenv").config();

const VegetationProvider = require(
    "./src/services/dataSources/vegetation/vegetationProvider"
);


const testVegetationProvider = async () => {
    try {
        const vegetationProvider =
            new VegetationProvider();

        const locations = [
            {
                name: "Guwahati Current Location",
                latitude: 26.1445,
                longitude: 91.7362
            },
            {
                name: "Kaziranga Forest Area",
                latitude: 26.5775,
                longitude: 93.1711
            },
            {
                name: "Delhi Urban Area",
                latitude: 28.6139,
                longitude: 77.2090
            }
        ];

        for (const location of locations) {
            console.log(
                `\nTesting: ${location.name}`
            );

            const result =
                await vegetationProvider.getData(
                    location.latitude,
                    location.longitude
                );

            console.log(result);
        }

    } catch (error) {
        console.error(
            "Test Failed:"
        );

        console.error(
            error.message
        );
    }
};


testVegetationProvider();