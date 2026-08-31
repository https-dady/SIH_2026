from fastapi import FastAPI
from schemas.prediction_schema import PredictionInput
from services.prediction_service import predict_landslide_risk


app = FastAPI(
    title="NER Landslide ML Service",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "success": True,
        "message": "NER Landslide ML Service is running"
    }


@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "ML service is healthy"
    }


@app.post("/predict")
def predict(data: PredictionInput):
    result = predict_landslide_risk(data)

    return {
        "success": True,
        "data": result
    }