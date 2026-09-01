const generateRiskInsights = (
    rawData,
    mlFeatures,
    riskInterpretation
) => {

    const keyFactors = [];

    const recommendations = [];


    /*
        Priority mapping
    */

    const priorityMap = {

        High:
            3,

        Medium:
            2,

        Low:
            1
    };


    /*
        Rainfall analysis
    */

    const rainfall =
        Number(
            rawData.rainfall_mm
        );


    if (
        Number.isFinite(
            rainfall
        )
    ) {

        let level;
        let impact;


        if (
            rainfall >= 100
        ) {

            level =
                "High";

            impact =
                "Heavy rainfall can significantly increase landslide susceptibility.";


            recommendations.push(
                "Avoid travelling near steep slopes during heavy rainfall."
            );

        } else if (
            rainfall >= 50
        ) {

            level =
                "Medium";

            impact =
                "Moderate rainfall may contribute to slope instability.";


            recommendations.push(
                "Monitor rainfall conditions and avoid unstable slopes if rainfall increases."
            );

        } else {

            level =
                "Low";

            impact =
                "Current rainfall contribution to landslide risk is relatively low.";
        }


        keyFactors.push({

            factor:
                "Rainfall",

            value:
                rainfall,

            level,

            priority:
                priorityMap[level],

            impact
        });
    }


    /*
        Soil moisture analysis
    */

    const soilMoisture =
        Number(
            rawData.soil_moisture_pct
        );


    if (
        Number.isFinite(
            soilMoisture
        )
    ) {

        let level;
        let impact;


        if (
            soilMoisture >= 70
        ) {

            level =
                "High";

            impact =
                "High soil moisture can reduce soil strength and slope stability.";


            recommendations.push(
                "Avoid staying near saturated slopes and watch for ground cracks."
            );

        } else if (
            soilMoisture >= 40
        ) {

            level =
                "Medium";

            impact =
                "Moderate soil moisture may contribute to slope instability.";

        } else {

            level =
                "Low";

            impact =
                "Current soil moisture conditions are relatively stable.";
        }


        keyFactors.push({

            factor:
                "Soil Moisture",

            value:
                soilMoisture,

            level,

            priority:
                priorityMap[level],

            impact
        });
    }


    /*
        Slope analysis
    */

    const slope =
        Number(
            rawData.slope_deg
        );


    if (
        Number.isFinite(
            slope
        )
    ) {

        let level;
        let impact;


        if (
            slope >= 30
        ) {

            level =
                "High";

            impact =
                "Steep terrain significantly increases landslide susceptibility.";


            recommendations.push(
                "Exercise extreme caution near steep slopes and hillside roads."
            );

        } else if (
            slope >= 15
        ) {

            level =
                "Medium";

            impact =
                "Moderate slope angle contributes to landslide susceptibility.";

        } else {

            level =
                "Low";

            impact =
                "Gentle terrain reduces slope-related landslide risk.";
        }


        keyFactors.push({

            factor:
                "Slope",

            value:
                slope,

            level,

            priority:
                priorityMap[level],

            impact
        });
    }


    /*
        Historical landslide analysis
    */

    if (
        mlFeatures.historical_landslide === 1
    ) {

        keyFactors.push({

            factor:
                "Historical Landslides",

            value:
                true,

            level:
                "High",

            priority:
                priorityMap.High,

            impact:
                "Previous landslide activity has been detected near this location."
        });


        recommendations.push(
            "Stay alert because previous landslide activity indicates a potentially vulnerable area."
        );

    } else {

        keyFactors.push({

            factor:
                "Historical Landslides",

            value:
                false,

            level:
                "Low",

            priority:
                priorityMap.Low,

            impact:
                "No nearby historical landslide activity was detected."
        });
    }


    /*
        NDVI / vegetation analysis
    */

    const ndvi =
        Number(
            mlFeatures.ndvi
        );


    if (
        Number.isFinite(
            ndvi
        )
    ) {

        let level;
        let impact;


        if (
            ndvi < 0.3
        ) {

            level =
                "High";

            impact =
                "Low vegetation cover may reduce natural slope protection.";


            recommendations.push(
                "Areas with limited vegetation cover may require additional slope monitoring."
            );

        } else if (
            ndvi < 0.6
        ) {

            level =
                "Medium";

            impact =
                "Moderate vegetation cover provides partial slope protection.";

        } else {

            level =
                "Low";

            impact =
                "Good vegetation cover may help improve slope stability.";
        }


        keyFactors.push({

            factor:
                "Vegetation",

            value:
                ndvi,

            level,

            priority:
                priorityMap[level],

            impact
        });
    }


    /*
        Sort factors by priority

        High   -> 3
        Medium -> 2
        Low    -> 1
    */

    const topRiskFactors =
        [...keyFactors]
            .sort(
                (
                    factorA,
                    factorB
                ) =>
                    factorB.priority -
                    factorA.priority
            )
            .slice(
                0,
                3
            );


    /*
        Overall risk recommendation
    */

    if (
        riskInterpretation.riskLevel ===
        "High"
    ) {

        recommendations.push(
            "Avoid unnecessary travel through high-risk zones."
        );

        recommendations.push(
            "Follow local authority warnings and evacuation instructions."
        );

    } else if (
        riskInterpretation.riskLevel ===
        "Medium"
    ) {

        recommendations.push(
            "Stay updated on weather conditions and monitor changes in the area."
        );

    } else {

        recommendations.push(
            "Current overall risk is low, but conditions can change with rainfall and weather."
        );
    }


    /*
        Remove duplicate recommendations
    */

    const uniqueRecommendations =
        [
            ...new Set(
                recommendations
            )
        ];


    /*
        Final structured response
    */

    return {

        overallRisk: {

            riskLevel:
                riskInterpretation.riskLevel,

            riskScore:
                riskInterpretation.riskScore,

            riskPercentage:
                riskInterpretation.riskPercentage,

            explanation:
                riskInterpretation.explanation
        },


        /*
            Top 3 highest
            priority factors
        */

        topRiskFactors,


        /*
            All analysed factors
        */

        keyFactors,


        /*
            Safety recommendations
        */

        recommendations:
            uniqueRecommendations,


        summary:

            `${riskInterpretation.riskLevel} landslide risk detected with a risk score of ${riskInterpretation.riskPercentage}%.`
    };
};


module.exports = {

    generateRiskInsights

};