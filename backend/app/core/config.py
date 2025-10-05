from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    NASA_API_KEY: str  # obligatorio
    ISITWATER_API_KEY: str  # obligatoria


    class Config:
        env_file = ".env"   # busca las variables en este archivo

settings = Settings()
