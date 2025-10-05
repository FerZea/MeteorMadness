import httpx
from app.core.config import settings

class IsItWaterClient:
    """
    Cliente para interactuar con la API IsItWater (vía RapidAPI).
    Solo se encarga de obtener los datos crudos desde la API.
    """

    BASE_URL = "https://isitwater-com.p.rapidapi.com/"

    def __init__(self, api_key: str = settings.ISITWATER_API_KEY):
        """
        Inicializa el cliente con la API Key almacenada en el archivo .env.
        """
        self.api_key = api_key
        self.headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "isitwater-com.p.rapidapi.com",
        }

    async def fetch_is_water(self, lat: float, lon: float) -> dict:
        """
        Llama al endpoint de IsItWater y devuelve el JSON crudo.
        Args:
            lat (float): Latitud del punto a verificar (-90 a 90).
            lon (float): Longitud del punto a verificar (-180 a 180).

        Returns:
            dict: Datos devueltos por la API (sin procesar).
        """
        params = {"latitude": lat, "longitude": lon}

        async with httpx.AsyncClient() as client:
            response = await client.get(self.BASE_URL, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
