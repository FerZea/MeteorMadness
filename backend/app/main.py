from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_nasa import router as nasa_router
from app.api.routes_isitwater import router as isis_client

app = FastAPI(title="Meteor Impact API")

@app.get("/Meteors Madness")
def health():
    return {"ok": True}


app.include_router(nasa_router, prefix="/api", tags=["nasa"])
app.include_router(isis_client, prefix="/api", tags=["isitwater"])