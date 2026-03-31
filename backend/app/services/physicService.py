import logging
from app.clients import usgs_client
from app.domain.schemas import EarthquakeDetail, SimDetail
from app.domain.physics.impact import ImpactCalculator

logger = logging.getLogger(__name__)


class ImpactEarthquakeService:

    def run_simulation(
        self, relative_velocity: float, diameter: float, is_water: bool
    ) -> SimDetail | None:
        """Ejecuta la simulación de impacto y devuelve un SimDetail."""
        try:
            calc = ImpactCalculator(relative_velocity, diameter, is_water)
            return SimDetail(
                energy_in_megatons=round(calc.energyInMegaTons(), 2),
                impact_velocity=round(calc.impactVelocity(), 2),
                crater_diameter_m=round(calc.finalCraterDiameter() * 1000, 2),
                crater_depth_m=round(calc.finalCraterDepthKm() * 1000, 2),
            )
        except Exception as e:
            logger.error("Simulation error: %s", e)
            return None

    async def get_related_earthquake(self, magnitude: float) -> EarthquakeDetail | None:
        """Consulta USGS buscando un terremoto real de magnitud similar."""
        try:
            result = await usgs_client.get_earthquake_by_magnitude(magnitude)
            return EarthquakeDetail(**result) if result else None
        except Exception as e:
            logger.error("Error fetching earthquake data: %s", e)
            return None

    async def run_combined(
        self, relative_velocity: float, diameter: float, is_water: bool
    ) -> dict | None:
        """
        Ejecuta la simulación completa y busca un terremoto real comparable.
        Recibe los parámetros directamente, sin leer ningún archivo en disco.
        """
        simulation = self.run_simulation(relative_velocity, diameter, is_water)
        if not simulation:
            return None
        try:
            calc = ImpactCalculator(relative_velocity, diameter, is_water)
            seismic_magnitude = calc.seismicEffect()
            earthquake = await self.get_related_earthquake(seismic_magnitude)
            return {
                "simulation": simulation.model_dump(),
                "seismic_magnitude": round(seismic_magnitude, 2),
                "related_earthquake": earthquake.model_dump() if earthquake else None,
            }
        except Exception as e:
            logger.error("Combined service error: %s", e)
            return None
