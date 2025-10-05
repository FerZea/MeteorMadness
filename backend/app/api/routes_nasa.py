from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from app.services.nasa_service import NasaNeoService
from app.domain.schemas import MeteorListResponse
from app.domain.schemas import SimInput

router = APIRouter(prefix="/nasa", tags=["nasa"])
service = NasaNeoService()

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
    if payload.is_custom:
        # Custom asteroid sim
        print(f"🪐 CUSTOM -> {payload.name or 'Sin nombre'}")
        print(f"Lat: {payload.lat}, Lon: {payload.lon}")
        print(f"Diámetro: {payload.diameter_m} m, Velocidad: {payload.velocity_kms} km/s")
        return {"ok": True, "is_custom": payload.is_custom, "name": payload.name}

    else:
        # NASA asteroid sim
        print(f"☄️ NASA ID -> {payload.nasa_id}")
        print(f"Lat: {payload.lat}, Lon: {payload.lon}")
        return {"ok": True, "is_custom": payload.is_custom, "id": payload.nasa_id}
