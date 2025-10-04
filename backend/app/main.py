from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_simulation import router as sim_router
from app.api.routes_nasa import router as nasa_router

app = FastAPI(title="Meteor Impact API")

@app.get("/api/health")
def health():
    return {"ok": True}
