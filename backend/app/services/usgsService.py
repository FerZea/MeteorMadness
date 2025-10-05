from app.clients import usgs_client
from app.domain.schemas import EarthquakeDetail
import json

class EarthquakeService:
    def __init__(self, min_magnitude: float = 5.0):
        self.min_magnitude = min_magnitude

    def run_query(self) -> list[EarthquakeDetail]:
        """
        Calls the USGS client and returns a list of EarthquakeDetail objects.
        """
        results = usgs_client.get_earthquakes_by_magnitude(self.min_magnitude)
        return [EarthquakeDetail(**r) for r in results]

    def to_json(self):
        """
        Returns earthquake results as a JSON string.
        """
        details = self.run_query()
        return json.dumps([d.model_dump() for d in details], indent=2)