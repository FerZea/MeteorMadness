from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.domain.schemas import EarthquakeDetail, SimDetail, SimInput
from app.services.physicService import ImpactEarthquakeService
from app.services.nasa_service import NasaNeoService
from app.services.isitwater_service import IsItWaterService

router = APIRouter(prefix="/impact", tags=["impact"])


class SimulateResponse(BaseModel):
    simulation: SimDetail
    seismic_magnitude: float
    related_earthquake: EarthquakeDetail | None = None


physics_service = ImpactEarthquakeService()
nasa_service = NasaNeoService()
water_service = IsItWaterService()


@router.post("/simulate", response_model=SimulateResponse)
async def simulate_impact(payload: SimInput):
    """
    Endpoint unificado: recibe los parámetros del impacto, consulta las APIs
    externas necesarias y devuelve el resultado completo de la simulación.
    """
    if payload.lat is None or payload.lon is None:
        raise HTTPException(status_code=422, detail="lat y lon son requeridos")

    # 1. ¿El punto de impacto es agua o tierra?
    is_water: bool = await water_service.get_water_info(payload.lat, payload.lon)

    # 2. Obtener parámetros del asteroide
    if payload.is_custom:
        relative_velocity = float(payload.velocity_kms)
        diameter = float(payload.diameter_km)
    else:
        if not payload.nasa_id:
            raise HTTPException(status_code=422, detail="nasa_id es requerido para modo NASA")
        try:
            asteroid = await nasa_service.get_filtered_by_item(payload.nasa_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"NASA API error: {e}")
        relative_velocity = asteroid.velocity_km_s
        diameter = asteroid.estimated_diameter_km

    # 3. Ejecutar simulación completa
    result = await physics_service.run_combined(relative_velocity, diameter, is_water)
    if not result:
        raise HTTPException(status_code=500, detail="La simulación no pudo completarse")

    return SimulateResponse(
        simulation=SimDetail(**result["simulation"]),
        seismic_magnitude=result["seismic_magnitude"],
        related_earthquake=EarthquakeDetail(**result["related_earthquake"]) if result["related_earthquake"] else None,
    )
