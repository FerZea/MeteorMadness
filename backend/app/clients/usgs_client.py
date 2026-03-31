import httpx
from datetime import datetime


async def get_earthquake_by_magnitude(min_magnitude: float):
    """
    Consulta la API de USGS el terremoto más reciente con magnitud >= min_magnitude.
    Devuelve un diccionario con los datos del sismo o None si no se encuentra.
    """
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "minmagnitude": min_magnitude,
        "orderby": "time",
        "limit": 1,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    features = data.get("features", [])
    if not features:
        return None

    quake = features[0]
    props = quake.get("properties", {})
    coords = quake.get("geometry", {}).get("coordinates", [None, None, None])

    return {
        "id": quake.get("id"),
        "magnitude": props.get("mag"),
        "location": props.get("place"),
        "time_utc": datetime.utcfromtimestamp(props.get("time") / 1000).isoformat(),
        "longitude": coords[0],
        "latitude": coords[1],
        "depth_km": coords[2],
        "url": props.get("url"),
    }
