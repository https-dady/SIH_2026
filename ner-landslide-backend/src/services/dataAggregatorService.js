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


const getLocationData = async (latitude, longitude) => {
    const rainfallProvider = getRainfallProvider();
    const soilProvider = getSoilProvider();
    const terrainProvider = getTerrainProvider();
    const vegetationProvider = getVegetationProvider();
    const infrastructureProvider = getInfrastructureProvider();
    const geologyProvider = getGeologyProvider();
    const historyProvider = getHistoryProvider();

    const [
        rainfallData,
        soilData,
        terrainData,
        vegetationData,
        infrastructureData,
        geologyData,
        historyData
    ] = await Promise.all([
        rainfallProvider.getData(latitude, longitude),
        soilProvider.getData(latitude, longitude),
        terrainProvider.getData(latitude, longitude),
        vegetationProvider.getData(latitude, longitude),
        infrastructureProvider.getData(latitude, longitude),
        geologyProvider.getData(latitude, longitude),
        historyProvider.getData(latitude, longitude)
    ]);

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