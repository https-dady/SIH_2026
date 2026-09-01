const interpretRisk = (
    predictionResult
) => {

    const {
        prediction,
        probabilities
    } = predictionResult;


    /*
        Model probabilities ko
        safely Number mein convert karo
    */

    const lowProbability =
        Number(
            probabilities?.Low || 0
        );

    const mediumProbability =
        Number(
            probabilities?.Medium || 0
        );

    const highProbability =
        Number(
            probabilities?.High || 0
        );


    /*
        Probability weighted risk score

        Low    = 0
        Medium = 50
        High   = 100

        Example:

        Low    0.72
        Medium 0.26
        High   0.01

        Score:

        (0.72 × 0)
        +
        (0.26 × 50)
        +
        (0.01 × 100)

        = 14.53
    */

    const calculatedRiskScore =
        (
            lowProbability * 0
        ) +
        (
            mediumProbability * 50
        ) +
        (
            highProbability * 100
        );


    /*
        Ensure score remains
        between 0 and 100
    */

    const normalizedRiskScore =
        Math.max(
            0,
            Math.min(
                100,
                calculatedRiskScore
            )
        );


    /*
        Final percentage
    */

    const riskPercentage =
        Number(
            normalizedRiskScore.toFixed(
                2
            )
        );


    /*
        Risk explanation
    */

    let explanation;


    if (
        prediction === "High"
    ) {

        explanation =
            "High landslide risk detected for this location.";

    } else if (
        prediction === "Medium"
    ) {

        explanation =
            "Moderate landslide risk detected for this location.";

    } else {

        explanation =
            "Low landslide risk detected for this location.";
    }


    return {

        riskLevel:
            prediction,

        riskScore:
            riskPercentage,

        riskPercentage,

        explanation,

        probabilities: {

            Low:
                lowProbability,

            Medium:
                mediumProbability,

            High:
                highProbability
        }
    };
};


module.exports = {
    interpretRisk
};