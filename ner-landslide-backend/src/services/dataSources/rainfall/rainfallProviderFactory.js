const RainfallProvider = require("./rainfallProvider");


const getRainfallProvider = () => {
    return new RainfallProvider();
};


module.exports = {
    getRainfallProvider
};