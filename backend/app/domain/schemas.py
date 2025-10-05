# app/domain/schemas.py
from typing import Any, Dict, List, Literal, Optional, Union
from datetime import date
from pydantic import BaseModel, field_validator

# ---------- ENTRADA PARA SIMULACIÓN ----------
class CustomSimInput(BaseModel):
    type: Literal["custom"]
    lat: float
    lon: float
    diameter_m: float
    velocity_kms: float
    name: Optional[str] = None
    
    @field_validator('lat')
    def validate_lat(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('La latitud debe estar entre -90 y 90')
        return v


class NasaSimInput(BaseModel):
    type: Literal["nasa"]
    nasa_id: int  # NASA lo maneja como string
    lat: float
    lon: float

    @field_validator('lat')
    def validate_lat(cls, v):
        if not -90 <= v <= 90:
            raise ValueError('La latitud debe estar entre -90 y 90')
        return v

SimInput = Union[CustomSimInput, NasaSimInput]

# ---------- LISTADO (pantalla 1) ----------
class MeteorListItem(BaseModel):
    id: int
    name: str
    estimated_diameter_km: float
    is_potentially_hazardous: bool
    close_approach_date_full: str
    velocity_km_s: float
    miss_distance_km: float


class MeteorListResponse(BaseModel):
    range: List[str]
    count: int
    asteroids: List[MeteorListItem]

# ---------- DETALLE / CÁLCULOS (pantalla 2) ----------
class SimSummary(BaseModel):
    diameter_m: float
    velocity_kms: float

class SimDetail(BaseModel):
    energy_in_megatons: float
    impact_velocity: float
    crater_diameter_m: float
    crater_depth_m: float


class EarthquakeDetail(BaseModel):
    id: str
    magnitude: float
    location: str
    time_utc: str
    longitude: float
    latitude: float
    depth_km: float
   

# ---------- DETALLES SOBRE ISIT WATERAPPI ----------
class IsitWater(BaseModel):
    water: bool
    latitude: float
    longitude: float

__all__ = [
    "CustomSimInput", "NasaSimInput", "SimInput",
    "MeteorListItem", "MeteorListResponse",
    "SimSummary", "SimDetail", "IsitWater"
]
