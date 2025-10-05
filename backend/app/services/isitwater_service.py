from typing import List
from app.domain.schemas import IsitWater
from app.clients.isist_client import IsItWaterClient

class IsItWaterService:
    """
    Servicio para consultar la API de IsItWater y devolver un JSON limpio al frontend.
    """

    def __init__(self, client: IsItWaterClient | None = None):
        self.client = client or IsItWaterClient()

    async def get_water_info(self, lat: float, lon: float) -> IsitWater:
        """
        Llama al cliente de IsItWater y transforma la respuesta en el formato del dominio.
        """
        data = await self.client.fetch_is_water(lat, lon)
        # La API suele regresar {"water": true/false}. Defensivo por si falta el campo:
        return bool(data.get("water", False))

