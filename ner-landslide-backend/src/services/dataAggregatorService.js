// const {
//     getRainfallProvider
// } = require("./dataSources/rainfall/rainfallProviderFactory");

// const {
//     getSoilProvider
// } = require("./dataSources/soil/soilProviderFactory");

// const {
//     getTerrainProvider
// } = require("./dataSources/terrain/terrainProviderFactory");

// const {
//     getVegetationProvider
// } = require("./dataSources/vegetation/vegetationProviderFactory");

// const {
//     getInfrastructureProvider
// } = require("./dataSources/infrastructure/infrastructureProviderFactory");

// const {
//     getGeologyProvider
// } = require("./dataSources/geology/geologyProviderFactory");

// const {
//     getHistoryProvider
// } = require("./dataSources/history/historyProviderFactory");


// const getLocationData = async (latitude, longitude) => {
//     const rainfallProvider = getRainfallProvider();
//     const soilProvider = getSoilProvider();
//     const terrainProvider = getTerrainProvider();
//     const vegetationProvider = getVegetationProvider();
//     const infrastructureProvider = getInfrastructureProvider();
//     const geologyProvider = getGeologyProvider();
//     const historyProvider = getHistoryProvider();

//     const [
//         rainfallData,
//         soilData,
//         terrainData,
//         vegetationData,
//         infrastructureData,
//         geologyData,
//         historyData
//     ] = await Promise.all([
//         rainfallProvider.getData(latitude, longitude),
//         soilProvider.getData(latitude, longitude),
//         terrainProvider.getData(latitude, longitude),
//         vegetationProvider.getData(latitude, longitude),
//         infrastructureProvider.getData(latitude, longitude),
//         geologyProvider.getData(latitude, longitude),
//         historyProvider.getData(latitude, longitude)
//     ]);

//     return {
//         ...rainfallData,
//         ...soilData,
//         ...terrainData,
//         ...vegetationData,
//         ...infrastructureData,
//         ...geologyData,
//         ...historyData
//     };
// };


// module.exports = {
//     getLocationData
// };


const {
    getRainfallProvider
} = require("./dataSources/rainfall/rainfallProviderFactory");

const {
    getSoilProvider
} = require("./dataSources/soil/soilProviderFactory");

const {
    getTerrainProvider
} = require("./dataSources/terrain/terrainProviderFactory");

const {
    getVegetationProvider
} = require("./dataSources/vegetation/vegetationProviderFactory");

const {
    getInfrastructureProvider
} = require("./dataSources/infrastructure/infrastructureProviderFactory");

const {
    getGeologyProvider
} = require("./dataSources/geology/geologyProviderFactory");

const {
    getHistoryProvider
} = require("./dataSources/history/historyProviderFactory");


const getLocationData =
    async (
        latitude,
        longitude
    ) => {

        const rainfallProvider =
            getRainfallProvider();

        const soilProvider =
            getSoilProvider();

        const terrainProvider =
            getTerrainProvider();

        const vegetationProvider =
            getVegetationProvider();

        const infrastructureProvider =
            getInfrastructureProvider();

        const geologyProvider =
            getGeologyProvider();

        const historyProvider =
            getHistoryProvider();


        /*
            Helper to measure
            provider execution time
        */

        const measureProvider =
            async (
                name,
                provider
            ) => {

                const startTime =
                    Date.now();

                console.log(
                    `${name} started`
                );


                const data =
                    await provider.getData(
                        latitude,
                        longitude
                    );


                const endTime =
                    Date.now();


                console.log(
                    `${name} completed in ${
                        endTime - startTime
                    } ms`
                );


                return data;
            };


        const totalStartTime =
            Date.now();


        const [

            rainfallData,

            soilData,

            terrainData,

            vegetationData,

            infrastructureData,

            geologyData,

            historyData

        ] =

            await Promise.all(

                [

                    measureProvider(
                        "Rainfall",
                        rainfallProvider
                    ),

                    measureProvider(
                        "Soil",
                        soilProvider
                    ),

                    measureProvider(
                        "Terrain",
                        terrainProvider
                    ),

                    measureProvider(
                        "Vegetation",
                        vegetationProvider
                    ),

                    measureProvider(
                        "Infrastructure",
                        infrastructureProvider
                    ),

                    measureProvider(
                        "Geology",
                        geologyProvider
                    ),

                    measureProvider(
                        "History",
                        historyProvider
                    )
                ]
            );


        console.log(
            `TOTAL LOCATION DATA TIME: ${
                Date.now() -
                totalStartTime
            } ms`
        );


        return {

            ...rainfallData,

            ...soilData,

            ...terrainData,

            ...vegetationData,

            ...infrastructureData,

            ...geologyData,

            ...historyData
        };
    };


module.exports = {
    getLocationData
};