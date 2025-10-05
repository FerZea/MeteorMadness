from fastapi import APIRouter, HTTPException, Query
from app.services.isitwater_service import IsItWaterService
from app.domain.schemas import IsitWater

router = APIRouter(prefix="/nasa", tags=["nasa"])
service = IsItWaterService()

@router.get("/waterCheck", response_model=IsitWater)
async def check_if_point_is_water(
    lat: float = Query(..., ge=-90, le=90, description="Latitud (-90 a 90)"),
    lon: float = Query(..., ge=-180, le=180, description="Longitud (-180 a 180)")
):
    """
    Determina si las coordenadas dadas están sobre agua o tierra
    usando la API de IsItWater (RapidAPI).
    """
    try:
        # Llamamos al servicio, pasando latitud y longitud
        result = await service.get_water_info(lat, lon)

        # Retornamos directamente el JSON (ya normalizado o crudo, según tu service)
        return result

    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error consultando IsItWater: {str(e)}")
