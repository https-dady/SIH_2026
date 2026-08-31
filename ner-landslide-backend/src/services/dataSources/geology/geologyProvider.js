const BaseProvider = require("../baseProvider");


class GeologyProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Geology data source is not configured yet"
        );
    }
}


module.exports = GeologyProvider;