from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Meteor Impact API")

@app.get("/api/health")
def health():
    return {"ok": True}
