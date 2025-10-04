# app/domain/schemas.py
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel

# ---------- ENTRADA PARA SIMULACIÓN ----------
class CustomSimInput(BaseModel):
    type: Literal["custom"]
    lat: float
    lon: float
    diameter_m: float
    velocity_kms: float
    name: Optional[str] = None

class NasaSimInput(BaseModel):
    type: Literal["nasa"]
    nasa_id: str     # NASA lo maneja como string (aunque parezca número)
    lat: float
    lon: float

SimInput = Union[CustomSimInput, NasaSimInput]

# ---------- LISTADO (pantalla 1) ----------
class MeteorListItem(BaseModel):
    nasa_id: str
    name: str
    diameter_m: float
    velocity_kms: float

class MeteorListResponse(BaseModel):
    count: int
    meteors: List[MeteorListItem]

# ---------- DETALLE / CÁLCULOS (pantalla 2) ----------
class SimSummary(BaseModel):
    # “resumen” mínimo (si no quieres GeoJSON aquí)
    name: str
    diameter_m: float
    velocity_kms: float

class SimDetail(BaseModel):
    # Datos calculados para la segunda pantalla
    name: str
    energy_in_megatons: float
    impact_velocity: float
    crater_diameter_m: float
    crater_depth_m: float
  

__all__ = [
    "CustomSimInput", "NasaSimInput", "SimInput",
    "MeteorListItem", "MeteorListResponse",
    "SimSummary", "SimDetail",
]
