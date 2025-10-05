from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_nasa import router as nasa_router

app = FastAPI(title="Meteor Impact API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods={"*"},
    allow_headers=["*"]
)


@app.get("/Meteors Madness")
def health():
    return {"ok": True}


app.include_router(nasa_router, prefix="/api", tags=["nasa"])