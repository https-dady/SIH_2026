const VegetationProvider = require("./vegetationProvider");

const getVegetationProvider = () => {
    return new VegetationProvider();
};

module.exports = {
    getVegetationProvider
};