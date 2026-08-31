const BaseProvider =
    require("../baseProvider");


const pool =
    require("../../../config/postgres");


class InfrastructureProvider
    extends BaseProvider {


    async getNearestRoadDistance(
        latitude,
        longitude
    ) {

        try {

            console.log(
                "INFRA PROVIDER VERSION: POSTGIS DATABASE"
            );


            const query = `

                WITH user_location AS (

                    SELECT
                        ST_Transform(

                            ST_SetSRID(

                                ST_MakePoint(
                                    $2,
                                    $1
                                ),

                                4326

                            ),

                            3857

                        ) AS point

                )

                SELECT

                    ST_Distance(

                        planet_osm_line.way,

                        user_location.point

                    ) AS distance

                FROM
                    planet_osm_line

                CROSS JOIN
                    user_location

                WHERE

                    planet_osm_line.highway
                    IS NOT NULL

                ORDER BY

                    planet_osm_line.way
                    <->
                    user_location.point

                LIMIT 1;

            `;


            const result =
                await pool.query(

                    query,

                    [

                        latitude,

                        longitude

                    ]

                );


            if (

                !result.rows ||

                result.rows.length === 0

            ) {

                throw new Error(

                    "No road found in database"

                );

            }


            const distance =
                Number(

                    result.rows[0]
                        .distance

                );


            if (

                !Number.isFinite(
                    distance
                )

            ) {

                throw new Error(

                    "Unable to calculate nearest road distance"

                );

            }


            console.log(

                `Nearest road distance: ${distance} meters`

            );


            return distance;

        } catch (
            error
        ) {

            console.error(

                "POSTGIS INFRASTRUCTURE ERROR:",

                error.message

            );


            throw new Error(

                `Failed to fetch infrastructure data: ${error.message}`

            );

        }

    }


    async getData(
        latitude,
        longitude
    ) {

        try {

            const distanceToRoad =
                await this.getNearestRoadDistance(

                    latitude,

                    longitude

                );


            return {

                distance_to_road_m:

                    Number(

                        distanceToRoad.toFixed(
                            2
                        )

                    )

            };

        } catch (
            error
        ) {

            throw new Error(

                `Failed to fetch infrastructure data: ${error.message}`

            );

        }

    }

}


module.exports =
    InfrastructureProvider;