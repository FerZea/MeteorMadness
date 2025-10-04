from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from app.services.nasa_service import NasaNeoService  # 👈 importamos la clase

router = APIRouter(prefix="/nasa", tags=["nasa"])
service = NasaNeoService()  # 👈 instanciamos la clase una sola vez

@router.get("/closest")
async def get_closest_asteroids(
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    try:
        # Si no hay fechas, se calcula un rango por defecto
        if not start_date or not end_date:
            today = date.today()
            start_date = today.isoformat()
            end_date = (today + timedelta(days=2)).isoformat()

        # 👇 Aquí es donde usamos el service
        asteroids = await service.get_filtered_asteroids(start_date, end_date)

        return {
            "range": [start_date, end_date],
            "count": len(asteroids),
            "asteroids": asteroids
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
