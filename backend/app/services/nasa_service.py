from typing import List
from app.domain.schemas import MeteorListItem
from app.clients.nasa_client import NasaNeoClient

class NasaNeoService:
    def __init__(self, client: NasaNeoClient | None = None):
        self.client = client or NasaNeoClient()

    @staticmethod
    def _parse_float(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    async def get_filtered_asteroids(self, start_date: str, end_date: str, limit: int = 10) -> List[MeteorListItem]:
        data = await self.client.fetch_neo_feed(start_date, end_date)
        results = []

        for day, asteroids in data.get("near_earth_objects", {}).items():
            for asteroid in asteroids:
                for approach in asteroid.get("close_approach_data", []):
                    if approach.get("orbiting_body") == "Earth":
                        diam = asteroid["estimated_diameter"]["kilometers"]
                        diameter_avg = (diam["estimated_diameter_min"] + diam["estimated_diameter_max"]) / 2

                        results.append(MeteorListItem(
                            id=int(asteroid["id"]),
                            name=asteroid["name"],
                            estimated_diameter_km=round(diameter_avg, 3),
                            is_potentially_hazardous=asteroid["is_potentially_hazardous_asteroid"],
                            close_approach_date_full=approach["close_approach_date_full"],
                            velocity_km_s=self._parse_float(approach["relative_velocity"]["kilometers_per_second"]),
                            miss_distance_km=self._parse_float(approach["miss_distance"]["kilometers"])
                        ))

        results.sort(key=lambda x: x.miss_distance_km)
        return results[:limit]
