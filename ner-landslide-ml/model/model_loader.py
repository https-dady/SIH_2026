from pathlib import Path
import joblib


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "landslide_risk_model_final.pkl"


def load_model():
    try:
        model_data = joblib.load(MODEL_PATH)

        model = model_data["model"]
        features = model_data["features"]

        print("ML model loaded successfully")

        return model, features

    except Exception as error:
        print(f"Failed to load ML model: {error}")
        raise error


model, features = load_model()