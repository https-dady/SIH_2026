const SoilProvider = require("./soilProvider");

const getSoilProvider = () => {
    return new SoilProvider();
};

module.exports = {
    getSoilProvider
};