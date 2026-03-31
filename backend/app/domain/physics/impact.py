import math
import logging

logger = logging.getLogger(__name__)

# ── Constantes físicas ───────────────────────────────────────────────────────
PI              = math.pi
ESCAPE_VELOCITY = 11.2    # km/s
DRAG_C          = 2
SEA_DENSITY     = 1.225   # kg/m³
SCALE_H         = 8       # km
EULER           = math.e
GRAVITY         = 9.81e-3 # km/s²
DENSITY         = 3000    # kg/m³, densidad media de meteorito


class ImpactCalculator:
    """
    Calcula la física de un impacto a partir de los parámetros recibidos directamente,
    sin depender de ningún archivo intermedio en disco.
    """

    def __init__(self, relative_velocity: float, diameter: float, is_water: bool = False) -> None:
        if diameter <= 0:
            raise ValueError(f"diameter debe ser > 0, recibido: {diameter}")
        self.relative_velocity: float = relative_velocity
        self.diameter: float = diameter
        self.target_density: float = 1000.0 if is_water else 2500.0
        self.entry_velocity: float = math.sqrt(ESCAPE_VELOCITY**2 + relative_velocity**2)

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
        df = self.finalCraterDiameter()
        return 0.20 * df if df < 4.0 else 0.12 * df

    # ── Efecto sísmico ───────────────────────────────────────────────────────

    def seismicEffect(self) -> float:
        return 0.67 * math.log10(self.kineticEnergy()) - 5.87

    # ── Radio térmico ────────────────────────────────────────────────────────

    def thermalRadius(self) -> float:
        return 0.002 * (self.kineticEnergy() ** (1 / 3))
