from app.clients import usgs_client
from app.domain.schemas import EarthquakeDetail, SimDetail
from app.domain.physics import impact
import json


class ImpactEarthquakeService:
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path

    def run_simulation(self) -> SimDetail | None:
        """
        Runs the asteroid impact simulation and returns a SimDetail object.
        """
        try:
            energy = impact.energyInMegaTons()
            velocity = impact.impactVelocity()
            crater_diameter = impact.finalCraterDiameter() * 1000  # km → m
            crater_depth = impact.finalCraterDepthKm() * 1000      # km → m

            return SimDetail(
                energy_in_megatons=round(energy, 2),
                impact_velocity=round(velocity, 2),
                crater_diameter_m=round(crater_diameter, 2),
                crater_depth_m=round(crater_depth, 2)
            )

        except Exception as e:
            print(f"Simulation error: {e}")
            return None

    def get_related_earthquake(self, magnitude: float) -> EarthquakeDetail | None:
        """
        Queries the USGS API for a real earthquake close to the simulated magnitude.
        """
        try:
            result = usgs_client.get_earthquake_by_magnitude(magnitude)
            if not result:
                return None
            return EarthquakeDetail(**result)
        except Exception as e:
            print(f"Error fetching earthquake data: {e}")
            return None

    def run_combined(self):
        """
        Runs the impact simulation, derives its seismic effect,
        and finds a real earthquake with a similar magnitude.
        Returns a combined result dictionary.
        """
        simulation = self.run_simulation()
        if not simulation:
            return None

        try:
            # Get seismic effect (Richter magnitude equivalent)
            seismic_magnitude = impact.seismicEffect()

            earthquake = self.get_related_earthquake(seismic_magnitude)

            return {
                "simulation": simulation.model_dump(),
                "seismic_magnitude": round(seismic_magnitude, 2),
                "related_earthquake": earthquake.model_dump() if earthquake else None
            }
        except Exception as e:
            print(f"Combined service error: {e}")
            return None

    def to_json(self):
        """
        Returns the combined simulation + earthquake result as JSON.
        """
        combined = self.run_combined()
        return json.dumps(combined, indent=2) if combined else None
