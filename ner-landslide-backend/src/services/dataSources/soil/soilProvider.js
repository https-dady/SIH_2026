const BaseProvider = require("../baseProvider");


class SoilProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Soil data source is not configured yet"
        );
    }
}


module.exports = SoilProvider;