const getMapRiskData =
    (
        latitude,
        longitude,
        predictionData
    ) => {

        return {

            location: {

                latitude,

                longitude
            },


            risk: {

                prediction:
                    predictionData.prediction,


                riskLevel:
                    predictionData.riskInterpretation
                        ?.riskLevel,


                riskScore:
                    predictionData.riskInterpretation
                        ?.riskScore,


                riskPercentage:
                    predictionData.riskInterpretation
                        ?.riskPercentage
            },


            mapVisualization: {

                markerType:
                    "selected-location"
            }
        };
    };


module.exports = {

    getMapRiskData
};