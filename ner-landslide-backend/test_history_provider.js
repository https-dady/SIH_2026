require("dotenv").config();

const HistoryProvider =
    require(
        "./src/services/dataSources/history/historyProvider"
    );


const testHistoryProvider =
    async () => {

        try {

            const provider =
                new HistoryProvider();


            console.log(
                "Fetching historical landslide data..."
            );


            const data =
                await provider.getData(

                    26.1445,

                    91.7362

                );


            console.log(
                "History Data:"
            );


            console.log(
                JSON.stringify(

                    data,

                    null,

                    2

                )
            );

        } catch (
            error
        ) {

            console.error(
                "Test Failed:"
            );


            console.error(
                error.message
            );

        }

    };


testHistoryProvider();