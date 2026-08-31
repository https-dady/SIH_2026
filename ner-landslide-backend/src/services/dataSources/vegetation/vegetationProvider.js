const BaseProvider = require("../baseProvider");


class VegetationProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Vegetation data source is not configured yet"
        );
    }
}


module.exports = VegetationProvider;