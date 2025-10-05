import httpx
from app.core.config import settings

class NasaNeoClient:
    """
    Cliente para interactuar con la API de NASA NEO (Near Earth Objects).
    Obtiene datos crudos desde los endpoints oficiales de la NASA.
    """

    BASE_URL = "https://api.nasa.gov/neo/rest/v1"

    def __init__(self, api_key: str = settings.NASA_API_KEY):
        self.api_key = api_key

    async def fetch_neo_feed(self, start_date: str, end_date: str) -> dict:
        """
        Obtiene el 'feed' de objetos cercanos a la Tierra en un rango de fechas.
        Endpoint: /feed
        """
        url = f"{self.BASE_URL}/feed"
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "api_key": self.api_key
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()  # lanza excepción si la respuesta es 4xx o 5xx
            return response.json()

    async def fetch_neo_by_id(self, neo_id: int) -> dict:
        """
        Obtiene los datos de un asteroide específico por su ID.
        Endpoint: /neo/{neo_id}
        """
        url = f"{self.BASE_URL}/neo/{neo_id}"
        params = {"api_key": self.api_key}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
