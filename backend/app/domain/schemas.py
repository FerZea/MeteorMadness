from typing import Dict, Any, Literal, Union, Optional
from pydantic import BaseModel

# --- Casos de input ---
class CustomSimInput(BaseModel):
    type: Literal["custom"]
    lat: float
    lon: float
    diameter_m: float
    velocity_kms: float

class NasaSimInput(BaseModel):
    type: Literal["nasa"]
    nasa_id: str
    lat: float
    lon: float

# --- Resultado ---
class resultNasaList(BaseModel):
    nasa_id: str
    name:str
    diameter_m: float
    velocity_kms: float

class resultShowNasaInfo(BaseModel):
    energy_in_megatons: float
    impact_velocity: float
    creater_diameter: float
    creater_depth: float


# --- Unión de ambos tipos ---
SimInput = Union[CustomSimInput, NasaSimInput]

__all__ = ["CustomSimInput", "NasaSimInput", "resultNasaList", "resultShowNasaInfo"]
