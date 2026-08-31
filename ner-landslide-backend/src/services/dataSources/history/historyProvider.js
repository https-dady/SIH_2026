const BaseProvider = require("../baseProvider");


class HistoryProvider extends BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "Historical landslide data source is not configured yet"
        );
    }
}


module.exports = HistoryProvider;