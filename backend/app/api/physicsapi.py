from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.domain.schemas import EarthquakeDetail, SimDetail
from app.services.physicService import ImpactEarthquakeService  # ensure this path is correct

router = APIRouter(prefix="/impact", tags=["impact"])

class CombinedResponse(BaseModel):
    simulation: SimDetail
    seismic_magnitude: float
    related_earthquake: EarthquakeDetail | None = None

service = ImpactEarthquakeService()

@router.get("/combined", response_model=CombinedResponse)
def run_combined():
    combined = service.run_combined()
    if not combined:
        raise HTTPException(status_code=500, detail="Failed to produce combined impact + earthquake result.")
    return CombinedResponse(
        simulation=SimDetail(**combined["simulation"]),
        seismic_magnitude=combined["seismic_magnitude"],
        related_earthquake=EarthquakeDetail(**combined["related_earthquake"]) if combined["related_earthquake"] else None
    )
