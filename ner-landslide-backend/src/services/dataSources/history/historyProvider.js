const BaseProvider =
    require("../baseProvider");


const pool =
    require(
        "../../../config/postgres"
    );


class HistoryProvider
    extends BaseProvider {


    async getData(
        latitude,
        longitude
    ) {

        const searchRadiusKm =
            50;


        const query = `
            SELECT

                COUNT(*) AS historical_event_count,

                MIN(
                    6371 *
                    acos(

                        LEAST(
                            1,

                            cos(
                                radians($1)
                            ) *

                            cos(
                                radians(latitude)
                            ) *

                            cos(
                                radians(longitude) -
                                radians($2)
                            ) +

                            sin(
                                radians($1)
                            ) *

                            sin(
                                radians(latitude)
                            )
                        )
                    )
                ) AS nearest_landslide_distance_km

            FROM
                historical_landslides_import

            WHERE

                latitude IS NOT NULL

                AND

                longitude IS NOT NULL

                AND

                latitude BETWEEN
                    $1 - 0.5
                    AND
                    $1 + 0.5

                AND

                longitude BETWEEN
                    $2 - 0.5
                    AND
                    $2 + 0.5
        `;


        try {

            const result =
                await pool.query(

                    query,

                    [

                        latitude,

                        longitude

                    ]
                );


            const data =
                result.rows[0];


            const eventCount =
                Number(
                    data
                        .historical_event_count
                );


            const nearestDistance =
                data
                    .nearest_landslide_distance_km;


            return {

                historical_landslide_count:

                    eventCount,


                nearest_historical_landslide_km:

                    nearestDistance
                        ? Number(
                            Number(
                                nearestDistance
                            ).toFixed(
                                2
                            )
                        )
                        : null,


                historical_landslide_within_radius:

                    nearestDistance !== null

                    &&

                    Number(
                        nearestDistance
                    ) <=
                    searchRadiusKm

            };

        } catch (
            error
        ) {

            throw new Error(

                `Failed to fetch historical landslide data: ${

                    error.message

                }`

            );

        }

    }

}


module.exports =
    HistoryProvider;