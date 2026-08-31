import pandas as pd

from model.model_loader import model, features


def predict_landslide_risk(input_data):
    # Pydantic data ko dictionary mein convert karo
    input_dict = input_data.model_dump()

    # Model ke saved feature order ke according DataFrame banao
    input_df = pd.DataFrame(
        [[input_dict[feature] for feature in features]],
        columns=features
    )

    # Prediction
    prediction = model.predict(input_df)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(input_df)[0]

    # Model classes
    classes = model.classes_

    probability_result = {
        str(class_name): round(float(probability), 4)
        for class_name, probability in zip(classes, probabilities)
    }

    return {
        "prediction": str(prediction),
        "probabilities": probability_result
    }