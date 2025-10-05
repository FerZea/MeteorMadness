import numpy as np
import math
import json
from pathlib import Path

density = 3000        # density (kg/m^3), average meteor density
PI = math.pi          # Pi constant
escapeVelocity = 11.2 # km/s
dragC = 2             # estimated drag coefficient
seaDensity = 1.225    # kg/m^3
scaleH = 8            # Km
eulerConstant = math.e  # Euler’s number
gravity = 9.81 * (10**-3)  # km/s^2
targetDensity = 2500  # sedimentary rock density

CONFIG_PATH = Path(__file__).with_name("config.json")
if not CONFIG_PATH.exists():
    raise FileNotFoundError(f"config.json not found at {CONFIG_PATH.resolve()}\n(cwd={Path.cwd()})")

with CONFIG_PATH.open("r") as f:
    config = json.load(f)

relativeVelocity = config.get("relativeVelocity")  # km/s
diameter = config.get("diameter")                  # km
isTargetWater = config.get("water")


if isTargetWater==1:
    targetDensity=1000
# Calculated constants
mass = (PI / 6) * (density ) * (1000*diameter**3) 
entryVelocity = math.sqrt((escapeVelocity**2) + (relativeVelocity)**2)

# Energy formulas
def kineticEnergy():
    E = (PI/12) * (density * 10**15) * (diameter**3) * (entryVelocity**2)
    return E

def energyInMegaTons():
    E = kineticEnergy()
    megatons = E / (4.18 * (10**15))
    return megatons

# Impact velocity formulas
def ballisticCoefficient():
    B = (density * diameter) / (dragC * seaDensity * scaleH)
    return B

def impactVelocity():
    b = ballisticCoefficient()
    if(diameter>1):
        return entryVelocity
    return entryVelocity * (eulerConstant ** (-1 / b))  # kms/s

# Crater formulas
def transientCraterDiameter():
    Vi = impactVelocity()
    ct = 1.161 * ((density / targetDensity)**(1/3)) * (diameter**0.78) * (Vi**0.44) * (gravity**-0.22)
    return ct

def finalCraterDiameter():
    return 1.25 * transientCraterDiameter()

def transientCreaterDepth():
    return transientCraterDiameter()/2


def finalCraterDepthKm():
    """
    Returns an estimate of the FINAL crater depth (rim-to-floor, in km).
    Uses a simple/complex split:
      - simple (< ~4 km final D): depth ≈ 20% of final diameter
      - complex (≥ ~4 km):        depth ≈ 12% of final diameter
    """
    Df = finalCraterDiameter()
    if Df < 4.0:
        return 0.20 * Df
    else:
        return 0.12 * Df    

# Earthquake formulas
def seismicEffect():
    return 0.67 * math.log10(kineticEnergy()) - 5.87


 #fireBall

def thermalRadius():
    0.002*(kineticEnergy**(1/3))   
