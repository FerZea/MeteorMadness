# app/services/config_manager.py
import json
from pathlib import Path
from typing import Any, Dict

# Ruta al mismo archivo que lee impact.py
CONFIG_PATH: Path = Path("/home/ferzea/Desktop/Hackthon_F/MeteorMadness/backend/app/domain/physics/config.json")
def write_impact_config(data: Dict[str, Any], path: Path | None = None) -> None:
    target = path or CONFIG_PATH
    target.parent.mkdir(parents=True, exist_ok=True)  # <- ahora sí tiene .parent
    with target.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
