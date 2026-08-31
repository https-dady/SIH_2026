const TerrainProvider = require("./terrainProvider");

const getTerrainProvider = () => {
    return new TerrainProvider();
};

module.exports = {
    getTerrainProvider
};