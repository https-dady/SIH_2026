const HistoryProvider = require("./historyProvider");

const getHistoryProvider = () => {
    return new HistoryProvider();
};

module.exports = {
    getHistoryProvider
};