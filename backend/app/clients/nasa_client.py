import httpx
from app.core.config import settings

class NasaNeoClient:
    """
    Cliente para interactuar con la API de NASA NEO (Near Earth Objects).
    Solo se encarga de obtener los datos crudos desde la API.
    """

    BASE_URL = "https://api.nasa.gov/neo/rest/v1/feed"

    def __init__(self, api_key: str = settings.NASA_API_KEY):
        self.api_key = api_key

    async def fetch_neo_feed(self, start_date: str, end_date: str) -> dict:
        """Llama al endpoint de NASA NEO Feed y devuelve el JSON crudo."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "api_key": self.api_key
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(self.BASE_URL, params=params)
            response.raise_for_status()
            return response.json()


