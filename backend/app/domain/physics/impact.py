import numpy as np
from typing import Dict, Tuple

def kinetic_energy_megatons(diameter_m: float, velocity_kms: float, density_kg_m3: float = 3000) -> float:
    r = diameter_m / 2.0
    volume = (4.0/3.0) * np.pi * r**3
    mass = density_kg_m3 * volume
    v = velocity_kms * 1000.0
    energy_j = 0.5 * mass * v**2
    MT = energy_j / (4.184e15)  # 1 megatón TNT ~ 4.184e15 J
    return float(MT)

def damage_radii_km(energy_mt: float) -> Dict[str, float]:
    # Placeholders: cambia por tus fórmulas/modelos
    return {
        "severe": float(0.8 * energy_mt**(1/3)),
        "moderate": float(1.6 * energy_mt**(1/3)),
        "light": float(3.0 * energy_mt**(1/3)),
    }

def circle_geojson(lon: float, lat: float, radius_km: float, steps: int=128) -> dict:
    # círculo aproximado en WGS84 (muy simple; puedes refinar con geodesia)
    coords = []
    R = 6371.0
    for i in range(steps+1):
        ang = 2*np.pi * i/steps
        d = radius_km / R
        lat1 = np.radians(lat); lon1 = np.radians(lon)
        lat2 = np.arcsin(np.sin(lat1)*np.cos(d) + np.cos(lat1)*np.sin(d)*np.cos(ang))
        lon2 = lon1 + np.arctan2(np.sin(ang)*np.sin(d)*np.cos(lat1), np.cos(d)-np.sin(lat1)*np.sin(lat2))
        coords.append([float(np.degrees(lon2)), float(np.degrees(lat2))])
    return {"type":"Feature","geometry":{"type":"Polygon","coordinates":[coords]},"properties":{}}
