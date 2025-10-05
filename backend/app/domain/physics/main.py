import impact




if __name__ == "__main__":
    final_diameter = impact.finalCraterDiameter()
    depth = impact.finalCraterDepthKm()
    energy = impact.energyInMegaTons()
    magnitude = impact.seismicEffect()

    print(f"Final Crater Diameter: {final_diameter:.2f} km")
    print(f"Crater Depth: {depth:.2f} km")
    print(f"Impact Energy: {energy:.2f} Megatons TNT")
    print(f"Estimated Seismic Magnitude: {magnitude:.2f} on Richter scale")
    
    try:
        mag = magnitude
        get_earthquakes_by_magnitude(mag)
    except ValueError:
        print("Please enter a valid number.")