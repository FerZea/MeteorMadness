# 🛰️ Meteor Impact App

Visualizador de impactos de meteoritos usando **FastAPI (backend)** + **React + Vite + TypeScript + Cesium (frontend)**, con datos de **NASA NEO** y **USGS**.

---

## 📦 Estructura del repositorio

```
meteor-app/
├── backend/               # API en FastAPI
│   ├── app/               # Lógica del backend
│   │   ├── api/           # Rutas de la API (endpoints)
│   │   │   └── routes_simulation.py   # Rutas de simulación (POST /impact)
│   │   ├── clients/       # Clientes externos (NASA, USGS, etc.)
│   │   │   ├── nasa_client.py        # Cliente para la API de NASA NEO
│   │   │   └── usgs_client.py        # Cliente para la API de USGS
│   │   ├── core/          # Configuración y variables de entorno
│   │   │   └── config.py            # Configuración usando pydantic-settings
│   │   ├── domain/        # Lógica de negocios (cálculos y reglas)
│   │   │   ├── physics/  # Cálculos de física (energía, radios de daño)
│   │   │   │   └── impact.py          # Cálculos de impacto y zonas de daño
│   │   │   └── schemas.py  # Esquemas de entrada y salida (SimInput, SimResult)
│   │   ├── services/      # Lógica de orquestación entre los diferentes componentes
│   │   │   └── simulation_service.py    # Servicio que coordina cálculos y llamadas API
│   │   └── main.py        # Punto de entrada de la API (FastAPI)
│   ├── requirements.txt   # Dependencias del backend
│   ├── .env               # Variables de entorno locales (no subir)
│   └── .env.example       # Plantilla para .env (sí subir)
│
├── frontend/              # Interfaz de usuario en React
│   ├── public/            # Archivos públicos (favicon, cesium)
│   │   └── cesium/        # Archivos estáticos de Cesium
│   ├── src/               # Código fuente del frontend
│   │   ├── components/    # Componentes de React
│   │   │   ├── CesiumGlobe.tsx    # Componente que muestra el globo Cesium
│   │   │   └── Controls.tsx       # Componente para los controles (input de usuario)
│   │   ├── api/           # Clientes para interactuar con la API del backend
│   │   │   └── client.ts  # Funciones para enviar datos al backend (simulateImpact)
│   │   ├── App.tsx        # Componente principal (inicia la aplicación)
│   │   ├── main.tsx       # Punto de entrada (renderiza <App /> y configura Vite)
│   │   ├── styles.css     # Estilos generales
│   │   └── vite.config.ts # Configuración de Vite
│   ├── .env.development   # Variables de entorno para desarrollo
│   ├── .env.example       # Plantilla para .env (sí subir)
│   ├── package.json       # Dependencias del frontend
│   └── index.html         # Plantilla HTML base
│
├── .gitignore             # Archivos y carpetas ignoradas por Git
└── README.md              # Documentación del proyecto
```

> 📌 **Regla**: `.env` y `.env.development` son privados → **no suben**.  
> En cambio `.env.example` sí se sube como **plantilla** para guiar al resto del equipo.

---

## 🔑 Variables de entorno

### Backend (`backend/.env`)

TIENES QUE CREARLA USA `.env.example` como ejemplo y cambiale el nombre a `.env`  o 
crea un archivo `.env` dentro de la carpeta `backend/` con la configuración siguiente:

```env
# NASA API Key (obligatoria, consíguela en https://api.nasa.gov)
NASA_API_KEY=tu_api_key_aqui

# USGS (opcional, solo si necesitas endpoints privados)
USGS_USERNAME=
USGS_PASSWORD=
```

⚠️ **No subas tu `.env` real a GitHub.** El archivo `.env` ya está en `.gitignore`.

### Frontend (`frontend/.env.development`)

En el archivo de plantilla `frontend/.env.example` ocupas copiar y cambiarlo a `.env.development` debe de contener con tu token de cesium lo siguiente:

```env
VITE_CESIUM_ION_TOKEN=your_cesium_token_here
VITE_API_BASE=http://localhost:8000/api
```

---

## 🌐 Fuentes de APIs y librerías externas

- **NASA NEO API** → [https://api.nasa.gov/](https://api.nasa.gov/)  
- **Cesium Ion (globo 3D)** → [https://cesium.com/platform/cesium-ion/](https://cesium.com/platform/cesium-ion/)  
- **USGS ScienceBase (Python client)** → [https://github.com/DOI-USGS/sciencebasepy](https://github.com/DOI-USGS/sciencebasepy)  

---

## ⬇️ Clonar el repositorio

```bash
# Clonar
git clone https://github.com/FerZea/Prueba_Space_apps.git
cd meteor-app

# Ver ramas disponibles
git branch -a

# Cambiar a main
git checkout main
```
---

## 🛠️ Instalación

### Backend (FastAPI)

#### Linux / macOS
1. Crear entorno virtual e instalar dependencias:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
2. Probar:  
- Health: http://localhost:8000/api/health  
- Docs: http://localhost:8000/docs  

#### Windows

**PowerShell**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
Copy-Item .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**CMD**
```bat
cd backend
python -m venv .venv
.\.venv\Scriptsctivate.bat
copy .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Git Bash**
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
cp .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

---

### Frontend (React + Vite + Cesium)

#### Linux / macOS
```bash
cd frontend
cp .env.example .env.development
npm install
npm run dev
# abre http://localhost:5173
```

#### Windows (PowerShell / CMD / Git Bash)

**PowerShell**
```powershell
cd frontend
Copy-Item .env.example .env.development
npm install
npm run dev
```

**CMD**
```bat
cd frontend
copy .env.example .env.development
npm install
npm run dev
```

**Git Bash**
```bash
cd frontend
cp .env.example .env.development
npm install
npm run dev
```

> En `src/main.tsx` debe existir:  
> `import 'cesium/Build/Cesium/Widgets/widgets.css';`

---

## 🧪 Flujo de trabajo con Git

```bash
# crear rama
git checkout main
git pull origin main
git checkout -b feat/<nombre>

# commit y push
git add .
git commit -m "feat: descripción clara"
git push -u origin feat/<nombre>

# abrir Pull Request en GitHub (base: main, compare: tu rama)
```

Si el remoto tiene cambios: `git pull --rebase origin main` y resuelve conflictos.

---

## 📚 Dependencias principales

**Backend**
- fastapi, uvicorn, httpx (NASA)
- sciencebasepy (USGS)
- numpy, pandas, shapely, pyproj
- python-dotenv / pydantic-settings
- pytest (dev)
- Tienes que descargar python y pip: https://www.python.org/downloads/ 

**Frontend**
- react, vite, typescript
- cesium (globo 3D)
- shx (copiado cross‑platform de assets Cesium)
- Tienes que descargar node.js : https://nodejs.org/es/download
---

## 🐛 Problemas comunes

- **`uvicorn: command not found`** → activa venv o usa `python -m uvicorn`.  
- **Globo de Cesium pequeño/negro** → falta `widgets.css` o `public/cesium`.  
- **CORS** → el proxy de Vite apunta a `http://localhost:8000` (cambia `VITE_API_BASE` si es necesario).  
- **Windows - error de scripts al activar venv** → ejecutar:  
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
---
