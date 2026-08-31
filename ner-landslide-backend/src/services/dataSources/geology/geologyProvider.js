const axios =
    require("axios");


const BaseProvider =
    require("../baseProvider");


class GeologyProvider
    extends BaseProvider {


    async getData(
        latitude,
        longitude
    ) {

        try {

            console.log(
                "Fetching geology data..."
            );


            const response =
                await axios.get(

                    "https://macrostrat.org/api/v2/geologic_units/map",

                    {

                        params: {

                            lat:
                                latitude,

                            lng:
                                longitude

                        },

                        timeout:
                            30000

                    }

                );


            const geologyData =
                response.data?.success?.data ||
                response.data?.data ||
                [];


            if (

                !Array.isArray(
                    geologyData
                ) ||

                geologyData.length === 0

            ) {

                throw new Error(

                    "No geology data found for this location"

                );

            }


            const geology =
                geologyData[0];


            console.log(
                "Geology data found:",
                geology.name
            );


            return {

                geology_name:

                    geology.name ||
                    null,


                lithology:

                    geology.lith ||
                    null,


                geological_period:

                    geology.t_int_name ||
                    null,


                geological_age_ma:

                    geology.t_age ||
                    null

            };

        } catch (
            error
        ) {

            console.error(

                "GEOLOGY PROVIDER ERROR:",

                error.response?.status ||

                error.message

            );


            throw new Error(

                `Failed to fetch geology data: ${

                    error.response?.data?.error ||

                    error.message

                }`

            );

        }

    }

}


module.exports =
    GeologyProvider;