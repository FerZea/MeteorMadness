import impact

if __name__ == "__main__":
    final_diameter = impact.finalCraterDiameter()
    depth = impact.final_crater_depth_km()
    energy = impact.energyInMegaTons()
    magnitude = impact.seismicEffect()

    print(f"Final Crater Diameter: {final_diameter:.2f} km")
    print(f"Crater Depth: {depth:.2f} km")
    print(f"Impact Energy: {energy:.2f} Megatons TNT")
    print(f"Estimated Seismic Magnitude: {magnitude:.2f} on Richter scale")
    