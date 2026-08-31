class BaseProvider {
    async getData(latitude, longitude) {
        throw new Error(
            "getData(latitude, longitude) must be implemented by the provider"
        );
    }
}

module.exports = BaseProvider;