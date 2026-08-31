const GeologyProvider = require("./geologyProvider");

const getGeologyProvider = () => {
    return new GeologyProvider();
};

module.exports = {
    getGeologyProvider
};