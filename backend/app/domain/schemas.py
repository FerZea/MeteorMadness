# app/domain/schemas.py
from typing import Any, Dict, List, Literal, Optional, Union
from datetime import date
from typing import Optional, Union, Annotated, Literal
from pydantic import BaseModel, Field, field_validator

# ---------- ENTRADA PARA SIMULACIÓN ----------


class CustomSimInput(BaseModel):
    # Discriminador
    is_custom: Literal[True]
    # Datos
    lat: float
    lon: float
    diameter_m: float
    velocity_kms: float
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

    @field_validator('diameter_m')
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
    is_custom: Literal[False]
    # Nota: NASA suele manejar IDs como string. Aceptamos str o int.
    nasa_id: Union[str, int]
    lat: float
    lon: float

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
SimInput = Annotated[Union[CustomSimInput, NasaSimInput], Field(discriminator='is_custom')]


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
