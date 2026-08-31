const BaseProvider = require("../baseProvider");


class RainfallProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Rainfall data source is not configured yet"
        );
    }
}


module.exports = RainfallProvider;