# app/domain/schemas.py
from typing import Any, Dict, List, Literal, Optional, Union
from datetime import date
from typing import Optional, Union, Annotated, Literal
from pydantic import BaseModel, Field, field_validator

# ---------- ENTRADA PARA SIMULACIÓN ----------


class CustomSimInput(BaseModel):
   is_custom: bool
   lat: Optional[float] = None
   lon: Optional[float] = None 
   diameter_km: Optional[float] = None
   velocity_kms: Optional[float] = None
   name: Optional[str] = None
   
   @field_validator('lat')
   @classmethod
   def validate_lat(cls, v: float):
        if not -90 <= v <= 90:
            raise ValueError('La latitud debe estar entre -90 y 90')
        return v
   
   @field_validator('lon')
   @classmethod
   def validate_lon(cls, v: float):
        if not -180 <= v <= 180:
            raise ValueError('La longitud debe estar entre -180 y 180')
        return v
   
   @field_validator('diameter_km')
   @classmethod
   def validate_diameter(cls, v: float):
        if v <= 0:
            raise ValueError('El diámetro debe ser positivo')
        return v
   
   @field_validator('velocity_kms')
   @classmethod
   def validate_velocity(cls, v: float):
        if v <= 0:
            raise ValueError('La velocidad debe ser positiva')
        return v


class NasaSimInput(BaseModel):
    # Discriminador
    is_custom: bool
    # Nota: NASA suele manejar IDs como string. Aceptamos str o int.
    nasa_id: Optional[Union[str, int]]=None
    lat: Optional[float] = None
    lon: Optional[float] =None

    @field_validator('lat')
    @classmethod
    def validate_lat(cls, v: float):
        if not -90 <= v <= 90:
            raise ValueError('La latitud debe estar entre -90 y 90')
        return v

    @field_validator('lon')
    @classmethod
    def validate_lon(cls, v: float):
        if not -180 <= v <= 180:
            raise ValueError('La longitud debe estar entre -180 y 180')
        return v


# Unión discriminada por el campo "is_custom"
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

__all__ = [
    "CustomSimInput", "NasaSimInput", "SimInput",
    "MeteorListItem", "MeteorListResponse",
    "SimSummary", "SimDetail", "IsitWater"
]
