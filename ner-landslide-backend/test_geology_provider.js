require("dotenv").config();

const {
    getGeologyProvider
} =
    require(
        "./src/services/dataSources/geology/geologyProviderFactory"
    );


const testGeologyProvider =
    async () => {

        try {

            const provider =
                getGeologyProvider();


            const data =
                await provider.getData(

                    26.1445,

                    91.7362

                );


            console.log(

                "Geology Data:"

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


testGeologyProvider();