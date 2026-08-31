from schemas.prediction_schema import PredictionInput
from services.prediction_service import predict_landslide_risk


data = PredictionInput(
    rainfall_mm=125.4,
    soil_moisture_pct=68.2,
    slope_deg=34.7,
    elevation_m=1840,
    ndvi=0.42,
    distance_to_road_m=125,
    lithology_factor=0.73,
    drainage_density_km_per_km2=2.81,
    historical_landslide=1
)

result = predict_landslide_risk(data)

print(result)