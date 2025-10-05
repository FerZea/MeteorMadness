import requests
from datetime import datetime

def get_earthquakes_by_magnitude(min_magnitude: float):
    """
    Queries the USGS API for earthquakes >= min_magnitude
    and returns a structured list of dictionaries.
    """
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "minmagnitude": min_magnitude,
        "orderby": "time",
        "limit": 5
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    earthquakes = []
    for quake in data.get("features", []):
        props = quake.get("properties", {})
        coords = quake.get("geometry", {}).get("coordinates", [None, None, None])

        earthquakes.append({
            "id": quake.get("id"),
            "magnitude": props.get("mag"),
            "location": props.get("place"),
            "time_utc": datetime.utcfromtimestamp(props.get("time") / 1000).isoformat(),
            "longitude": coords[0],
            "latitude": coords[1],
            "depth_km": coords[2],
            "url": props.get("url")
        })

    return earthquakes
