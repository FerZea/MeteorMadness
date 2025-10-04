from fastapi import APIRouter, HTTPException, Query
from datetime import date, timedelta
from app.services.nasa_service import NasaNeoService
from app.domain.schemas import MeteorListResponse

router = APIRouter(prefix="/nasa", tags=["nasa"])
service = NasaNeoService()

@router.get("/closest", response_model=MeteorListResponse)
async def get_closest_asteroids(
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    try:
        if not start_date or not end_date:
            today = date.today()
            start_date = today.isoformat()
            end_date = (today + timedelta(days=2)).isoformat()

        items = await service.get_filtered_asteroids(start_date, end_date)
        return {
            "range": [start_date, end_date],
            "count": len(items),
            "asteroids": items
        }

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
