from typing import List, Dict
from app.clients.nasa_client import NasaNeoClient

class NasaNeoService:
    """
    Servicio que usa el cliente de NASA para obtener datos y procesarlos.
    Se encarga de filtrar, calcular y devolver el JSON final.
    """

    def __init__(self, client: NasaNeoClient | None = None):
        self.client = client or NasaNeoClient()

    # Método auxiliar interno para manejar conversiones seguras a float
    @staticmethod
    def _parse_float(value: str) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    async def get_filtered_asteroids(
        self, start_date: str, end_date: str, limit: int = 10
    ) -> List[Dict]:
        """
        Obtiene y filtra los asteroides más cercanos a la Tierra en el rango de fechas indicado.
        Usa el cliente NASA para traer datos crudos y devuelve un JSON con campos seleccionados.
        """
        # 🔹 1️⃣ Llamamos al cliente para obtener los datos crudos de la NASA API
        data = await self.client.fetch_neo_feed(start_date, end_date)
        results = []

        # 🔹 2️⃣ Recorremos el JSON que viene agrupado por fecha
        for day, asteroids in data.get("near_earth_objects", {}).items():
            for asteroid in asteroids:
                for approach in asteroid.get("close_approach_data", []):
                    if approach.get("orbiting_body") == "Earth":
                        # 🔹 Calcular diámetro promedio (en km)
                        diam = asteroid["estimated_diameter"]["kilometers"]
                        diameter_avg = (
                            diam["estimated_diameter_min"] + diam["estimated_diameter_max"]
                        ) / 2

                        # 🔹 Crear estructura de salida (JSON limpio)
                        results.append({
                            "id": int(asteroid["id"]),
                            "name": asteroid["name"],
                            "name_limited": asteroid.get("name_limited", ""),
                            "estimated_diameter_km": round(diameter_avg, 3),
                            "is_potentially_hazardous": asteroid["is_potentially_hazardous_asteroid"],
                            "close_approach_date": approach["close_approach_date"],
                            "velocity_km_s": self._parse_float(
                                approach["relative_velocity"]["kilometers_per_second"]
                            ),
                            "miss_distance_km": self._parse_float(
                                approach["miss_distance"]["kilometers"]
                            ),
                        })

        # 🔹 3️⃣ Ordenamos por distancia (de menor a mayor)
        results.sort(key=lambda x: x["miss_distance_km"])

        # 🔹 4️⃣ Devolvemos solo los N más cercanos
        return results[:limit]
