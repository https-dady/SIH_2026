const BaseProvider = require("../baseProvider");


class InfrastructureProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Infrastructure data source is not configured yet"
        );
    }
}


module.exports = InfrastructureProvider;