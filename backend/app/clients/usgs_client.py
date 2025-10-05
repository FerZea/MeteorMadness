import requests
from datetime import datetime

def get_earthquake_by_magnitude(min_magnitude: float):
    """
    Queries the USGS API for the most recent earthquake >= min_magnitude
    and returns a single earthquake dictionary (or None if not found).
    """
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "minmagnitude": min_magnitude,
        "orderby": "time",
        "limit": 1  # only one result
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    features = data.get("features", [])
    if not features:
        return None  # no earthquake found

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
        "url": props.get("url")
    }
