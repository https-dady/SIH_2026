const TerrainProvider = require(
    "./src/services/dataSources/terrain/terrainProvider"
);


const testTerrainProvider = async () => {
    try {
        const terrainProvider = new TerrainProvider();

        const result = await terrainProvider.getData(
            26.1445,
            91.7362
        );

        console.log("Terrain Data:");
        console.log(result);
    } catch (error) {
        console.error("Test Failed:");
        console.error(error.message);
    }
};


testTerrainProvider();