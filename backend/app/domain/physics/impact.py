import math
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Constantes físicas (no cambian entre simulaciones) ──────────────────────
PI             = math.pi
ESCAPE_VELOCITY = 11.2    # km/s
DRAG_C         = 2        # coeficiente de arrastre estimado
SEA_DENSITY    = 1.225    # kg/m³
SCALE_H        = 8        # km
EULER          = math.e
GRAVITY        = 9.81e-3  # km/s²
DENSITY        = 3000     # kg/m³, densidad media de meteorito

CONFIG_PATH = Path(__file__).with_name("config.json")


class ImpactCalculator:
    """
    Ejecuta la física de impacto cargando los parámetros frescos de config.json
    en cada instanciación, de modo que siempre usa la última configuración escrita.
    """

    def __init__(self) -> None:
        cfg = self._read_config()
        self.relative_velocity: float = float(cfg["relativeVelocity"])  # km/s
        self.diameter: float = float(cfg["diameter"])                    # km
        if self.diameter <= 0:
            raise ValueError(f"diameter debe ser > 0, recibido: {self.diameter}")
        is_water = int(cfg.get("water", 0))
        self.target_density: float = 1000.0 if is_water == 1 else 2500.0
        self.entry_velocity: float = math.sqrt(
            ESCAPE_VELOCITY**2 + self.relative_velocity**2
        )

    @staticmethod
    def _read_config() -> dict:
        if not CONFIG_PATH.exists():
            raise FileNotFoundError(
                f"config.json no encontrado en {CONFIG_PATH.resolve()} (cwd={Path.cwd()})"
            )
        with CONFIG_PATH.open("r") as f:
            return json.load(f)

    # ── Energía ─────────────────────────────────────────────────────────────

    def kineticEnergy(self) -> float:
        return (PI / 12) * (DENSITY * 10**15) * (self.diameter**3) * (self.entry_velocity**2)

    def energyInMegaTons(self) -> float:
        return self.kineticEnergy() / 4.18e15

    # ── Velocidad de impacto ─────────────────────────────────────────────────

    def ballisticCoefficient(self) -> float:
        return (DENSITY * self.diameter) / (DRAG_C * SEA_DENSITY * SCALE_H)

    def impactVelocity(self) -> float:
        if self.diameter > 1:
            return self.entry_velocity
        b = self.ballisticCoefficient()
        if b == 0:
            raise ValueError("Coeficiente balístico es cero — revisa diameter/density")
        return self.entry_velocity * (EULER ** (-1.0 / b))

    # ── Cráter ───────────────────────────────────────────────────────────────

    def transientCraterDiameter(self) -> float:
        vi = self.impactVelocity()
        return (
            1.161
            * ((DENSITY / self.target_density) ** (1 / 3))
            * (self.diameter**0.78)
            * (vi**0.44)
            * (GRAVITY**-0.22)
        )

    def finalCraterDiameter(self) -> float:
        return 1.25 * self.transientCraterDiameter()

    def finalCraterDepthKm(self) -> float:
        """
        Profundidad final del cráter (km).
        Simple (<4 km): ≈20% del diámetro final.
        Complejo (≥4 km): ≈12% del diámetro final.
        """
        df = self.finalCraterDiameter()
        return 0.20 * df if df < 4.0 else 0.12 * df

    # ── Efecto sísmico ───────────────────────────────────────────────────────

    def seismicEffect(self) -> float:
        return 0.67 * math.log10(self.kineticEnergy()) - 5.87

    # ── Radio térmico ────────────────────────────────────────────────────────

    def thermalRadius(self) -> float:
        return 0.002 * (self.kineticEnergy() ** (1 / 3))
