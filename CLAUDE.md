# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

MeteorMadness es una aplicación de visualización de impactos de meteoritos creada para la NASA Space Apps Challenge 2025. Consta de un backend FastAPI (Python) y un frontend React + TypeScript con CesiumJS para renderizado 3D del globo.

## Comandos de desarrollo

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install          # también copia automáticamente los assets de Cesium a public/cesium/
npm run dev          # http://localhost:5173
npm run build        # tsc + vite build → dist/
npm run preview
```

### Tests del backend
```bash
cd backend
source .venv/bin/activate
pytest
```

## Variables de entorno

**backend/.env** (basarse en `.env.example`):
- `NASA_API_KEY` — clave de la NASA NEO API (requerida)
- `ISITWATER_API_KEY` — clave de RapidAPI para IsItWater (requerida)

**frontend/.env** (basarse en `.env.example`):
- `VITE_CESIUM_ION_TOKEN` — token de Cesium Ion para terreno 3D y satelital
- `VITE_API_BASE` — URL base del backend (por defecto proxeada como `/api`)

## Arquitectura

### Flujo de datos principal

1. El frontend pide la lista de asteroides: `GET /api/nasa/closest`
2. El usuario selecciona un asteroide y una ubicación en el globo Cesium
3. El frontend envía los datos: `POST /api/nasa/input`
4. El backend consulta IsItWater (¿agua o tierra?), escribe `app/domain/physics/config.json`
5. El frontend solicita la simulación: `GET /api/impact/combined`
6. El backend lee el config, ejecuta el motor de física (`domain/physics/impact.py`) y busca un terremoto similar en USGS
7. El resultado (`SimDetail` + `EarthquakeDetail`) se devuelve al frontend y se visualiza

### Proxy de desarrollo

Vite proxea `/api` → `http://localhost:8000`, por lo que en desarrollo el frontend solo usa `/api/...`.

### Estado en memoria (backend)

FastAPI guarda en `app.state`:
- `selections`: selecciones de asteroides
- `last_sim_input`: último input de simulación
- `lock`: `asyncio.Lock` para acceso concurrente

No hay base de datos; las simulaciones no persisten entre reinicios.

### Motor de física

`backend/app/domain/physics/impact.py` calcula: energía cinética (megatoreladas), dimensiones del cráter (diámetro transitorio → final, profundidad), magnitud sísmica equivalente y radio de bola de fuego. Lee los parámetros de `config.json` (velocidad, diámetro, agua/tierra).

### Fases del frontend

`App.tsx` controla la fase global:
```
"loading" → "gate" → "menu" → "custom" | "requests" → "cesium"
```

### Modelos de datos clave (`backend/app/domain/schemas.py`)
- `SimInput` — unión discriminada de `CustomSimInput` | `NasaSimInput`
- `SimDetail` — resultados de la simulación (energía, cráter, etc.)
- `EarthquakeDetail` — evento sísmico comparable de USGS

## Problema conocido

`config_manager.py` tiene una ruta hardcodeada a `/home/ferzea/Desktop/...`. Usar siempre rutas relativas a `__file__` al modificar ese fichero.
