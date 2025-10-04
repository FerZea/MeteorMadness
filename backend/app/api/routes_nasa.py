from fastapi import APIRouter, Query, HTTPException
from datetime import date, timedelta
from backend.app.clients.nasa_client import get_filtered_asteroids

router = APIRouter(prefix="/nasa", tags=["nasa"])

@router.get("/closest")
async def get_closest_asteroids(
    start_date: str = Query(None, description="Fecha inicial YYYY-MM-DD"),
    end_date: str = Query(None, description="Fecha final YYYY-MM-DD"),
):
    try:
        # Si no se pasan fechas, usar un rango de 2 días desde hoy
        if not start_date or not end_date:
            today = date.today()
            start_date = today.isoformat()
            end_date = (today + timedelta(days=2)).isoformat()

        items = await get_filtered_asteroids(start_date, end_date)
        return {"range": [start_date, end_date], "count": len(items), "asteroids": items}

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
