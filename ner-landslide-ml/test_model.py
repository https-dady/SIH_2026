import joblib

MODEL_PATH = "landslide_risk_model_final.pkl"

data = joblib.load(MODEL_PATH)

print("Model loaded successfully")
print("Loaded object type:", type(data))

if isinstance(data, dict):
    print("Keys:", data.keys())

    if "model" in data:
        print("ML model type:", type(data["model"]))

    if "features" in data:
        print("Features:", data["features"])