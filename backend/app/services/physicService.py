from app.domain.physics import impact
from app.domain.schemas import SimDetail


class PhysicsService:
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path

    def run_simulation(self) -> SimDetail:
        """
        Calls the physics/impact module calculations and returns a SimDetail object.
        Assumes impact.py handles config loading and all physics math internally.
        """

        # Run all calculations using your impact.py functions
        energy = impact.energyInMegaTons()
        velocity = impact.impactVelocity()
        crater_diameter = finalCraterDiameter()  * 1000# km 
        crater_depth =impact.finalCraterDepthKm() *1000  # km 

        # Wrap in your Pydantic schema
        return SimDetail(
            energy_in_megatons=round(energy, 2),
            impact_velocity=round(velocity, 2),
            crater_diameter_m=round(crater_diameter, 2),
            crater_depth_m=round(crater_depth, 2)
        )

    def to_json(self):
        """
        Returns the simulation as JSON.
        """
        detail = self.run_simulation()
        return detail.model_dump_json(indent=2)
