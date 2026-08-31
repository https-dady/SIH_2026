const InfrastructureProvider = require("./infrastructureProvider");

const getInfrastructureProvider = () => {
    return new InfrastructureProvider();
};

module.exports = {
    getInfrastructureProvider
};