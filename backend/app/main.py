from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_nasa import router as nasa_router
import asyncio
from app.api.routes_isitwater import router as isis_client

app = FastAPI(title="Meteor Impact API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods={"*"},
    allow_headers=["*"]
)

app.state.selections = {}   # dict: { asteroid_id: {"lat": float, "lon": float, "ts": datetime} }
app.state.lock = asyncio.Lock()

@app.get("/Meteors Madness")
def health():
    return {"ok": True}

app.state.last_sim_input = None
app.state.last_sim_lock = asyncio.Lock()

app.include_router(nasa_router, prefix="/api", tags=["nasa"])
