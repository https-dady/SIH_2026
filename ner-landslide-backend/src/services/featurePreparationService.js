const prepareMLFeatures = (
    rawData
) => {

    /*
        NDVI:

        Provider raw NDVI:
        -1 to +1

        Current ML schema/model input:
        0 to 1

        Normalize:
        (ndvi + 1) / 2
    */

    const rawNdvi =
        Number(rawData.ndvi);

    if (
        !Number.isFinite(rawNdvi)
    ) {

        throw new Error(
            "Invalid NDVI value"
        );
    }


    const ndvi =
        Math.max(
            0,
            Math.min(
                1,
                (
                    rawNdvi + 1
                ) / 2
            )
        );


    /*
        Lithology susceptibility factor.

        Higher factor =
        relatively weaker /
        more landslide-prone material.

        Lower factor =
        harder / more stable rock.

        Rule-based fallback mapping.
    */

    const lithology =
        (
            rawData.lithology ||
            rawData.geology_name ||
            ""
        )
            .toLowerCase();


    let lithologyFactor =
        0.6;


    if (
        lithology.includes(
            "unconsolidated"
        ) ||
        lithology.includes(
            "alluv"
        )
    ) {

        lithologyFactor =
            1.0;

    } else if (

        lithology.includes(
            "clay"
        ) ||

        lithology.includes(
            "shale"
        ) ||

        lithology.includes(
            "mudstone"
        )
    ) {

        lithologyFactor =
            0.9;

    } else if (

        lithology.includes(
            "sediment"
        ) ||

        lithology.includes(
            "sandstone"
        ) ||

        lithology.includes(
            "limestone"
        )
    ) {

        lithologyFactor =
            0.7;

    } else if (

        lithology.includes(
            "metamorphic"
        ) ||

        lithology.includes(
            "schist"
        ) ||

        lithology.includes(
            "gneiss"
        )
    ) {

        lithologyFactor =
            0.5;

    } else if (

        lithology.includes(
            "crystalline"
        ) ||

        lithology.includes(
            "igneous"
        ) ||

        lithology.includes(
            "granite"
        )
    ) {

        lithologyFactor =
            0.4;
    }


    /*
        Historical landslide:

        true  -> 1
        false -> 0
    */

    const historicalLandslide =
        rawData.historical_landslide_within_radius
            ? 1
            : 0;


    /*
        Final ML input.

        Exact field names required
        by PredictionInput schema.
    */

    return {

        rainfall_mm:

            Number(
                rawData.rainfall_mm
            ),


        soil_moisture_pct:

            Number(
                rawData.soil_moisture_pct
            ),


        slope_deg:

            Number(
                rawData.slope_deg
            ),


        elevation_m:

            Number(
                rawData.elevation_m
            ),


        ndvi:

            Number(
                ndvi.toFixed(
                    4
                )
            ),


        distance_to_road_m:

            Number(
                rawData.distance_to_road_m
            ),


        lithology_factor:

            lithologyFactor,


        drainage_density_km_per_km2:

            Number(
                rawData
                    .drainage_density_km_per_km2
            ),


        historical_landslide:

            historicalLandslide
    };
};


module.exports = {
    prepareMLFeatures
};