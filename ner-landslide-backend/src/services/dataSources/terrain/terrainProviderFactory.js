const TerrainProvider =
    require(
        "./terrainProvider"
    );


const terrainProvider =
    new TerrainProvider();


const getTerrainProvider =
    () => {

        return terrainProvider;

    };


module.exports = {

    getTerrainProvider

};