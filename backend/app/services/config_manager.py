# app/services/config_manager.py
import json
from pathlib import Path
from typing import Any, Dict

# Ruta relativa al mismo config.json que lee ImpactCalculator
CONFIG_PATH: Path = Path(__file__).parent.parent / "domain" / "physics" / "config.json"


def write_impact_config(data: Dict[str, Any], path: Path | None = None) -> None:
    target = path or CONFIG_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
