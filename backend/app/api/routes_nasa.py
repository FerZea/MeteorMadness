from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from app.services.nasa_service import NasaNeoService
from app.domain.schemas import MeteorListResponse
from app.domain.schemas import SimInput
from app.services.isitwater_service import IsItWaterService
from app.services.config_manager import write_impact_config

router = APIRouter(prefix="/nasa", tags=["nasa"])
service = NasaNeoService()
serviceWater = IsItWaterService()

@router.get("/closest", response_model=MeteorListResponse)
async def get_closest_asteroids():
    
        
    today = date.today()
    start_date = today.isoformat()
    end_date = (today + timedelta(days=2)).isoformat()

    items = await service.get_filtered_asteroids(start_date, end_date)
    return {
            "range": [start_date, end_date],
            "count": len(items),
            "asteroids": items
        }

@router.post("/input")
async def receive_sim_input(payload: SimInput):
    
    # 👇 Servicio devuelve bool
    is_water: bool = await serviceWater.get_water_info(payload.lat, payload.lon)
    water_flag = 1 if is_water else 0   # 👈 impact.py espera 0/1

    if payload.is_custom:
        config = {
            "relativeVelocity": float(payload.velocity_kms),  # km/s
            "diameter": float(payload.diameter_km),           # 👈 km directo
            "water": water_flag,
        }
        
        print(payload.diameter_km, payload.velocity_kms, water_flag)
    else:
        # TODO: resolver estos 2 a partir de nasa_id:
        estimated_diameter_km = 0.5
        relative_velocity_kms = 20.0
        config = {
            "relativeVelocity": relative_velocity_kms,       # km/s
            "diameter": estimated_diameter_km,               # km
            "water": water_flag,
        }

    write_impact_config(config)
    return {"ok": True, "saved_config": config}