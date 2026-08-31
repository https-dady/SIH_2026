from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    rainfall_mm: float = Field(..., ge=0)
    soil_moisture_pct: float = Field(..., ge=0, le=100)
    slope_deg: float = Field(..., ge=0, le=90)
    elevation_m: float = Field(..., ge=0)
    ndvi: float = Field(..., ge=0, le=1)
    distance_to_road_m: float = Field(..., ge=0)
    lithology_factor: float = Field(..., ge=0, le=1)
    drainage_density_km_per_km2: float = Field(..., ge=0)
    historical_landslide: int = Field(..., ge=0, le=1)