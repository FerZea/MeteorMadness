import { useEffect, useState } from "react";
import LoadingOverlay from "./components/LoadingOverlay";
import StartScreen from "./components/StartScreen";
import MainMenu from "./components/MainMenu";
import CustomMeteorPanel from "./components/CustomMeteorPanel";
import RequestsPanel from "./components/RequestsPanel";
import CesiumGlobe from "./components/CesiumGlobe";
import Controls from "./components/Controls";

type Phase = "loading" | "gate" | "menu" | "custom" | "requests" | "cesium";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");

  // Flag interno para saber si el meteoro es custom o de NASA
  const [isCustom, setIsCustom] = useState(false);

  // Id del asteroide seleccionado (solo cuando es de NASA)
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<number | null>(null);

  // Datos del meteorito personalizado
  const [meteor, setMeteor] = useState({
    diameter_m: 120,
    velocity_kms: 18.5,
    mass_kg: 5000,
  });

  // Coordenadas clickeadas en Cesium
  const [selected, setSelected] = useState<{ lat?: number; lon?: number }>({});

  useEffect(() => {
    const t = setTimeout(() => setPhase("gate"), 1200);
    return () => clearTimeout(t);
  }, []);

  // Handler de clic en el globo
  const handlePickOnGlobe = async ({ lat, lon }: { lat: number; lon: number }) => {

    // Solo obtiene Lat y Lon, el post se hara en controls.tsx
    setSelected({ lat, lon });
  };

  return (
    <>
      {phase === "loading" && <LoadingOverlay text="Cargando recursos…" />}
      {phase === "gate" && <StartScreen onStart={() => setPhase("menu")} />}

      {phase === "menu" && (
        <MainMenu
          onCustom={() => setPhase("custom")}
          onRequests={() => setPhase("requests")}
        />
      )}

      {/* Meteorito custom */}
      {phase === "custom" && (
        <CustomMeteorPanel
          onBack={() => setPhase("menu")}
          onOpenCesium={(diameter, velocity, masa) => {
            setMeteor({ diameter_m: diameter, velocity_kms: velocity, mass_kg: masa });
            setIsCustom(true);
            setSelectedAsteroidId(null);
            setPhase("cesium");
          }}
        />
      )}

      {/* Lista NASA */}
      {phase === "requests" && (
        <RequestsPanel
          onBack={() => setPhase("menu")}
          onSimulate={(id) => {
            // aquí decides el modo y navegas
            setIsCustom(false);           // es NASA
            setSelectedAsteroidId(id);
            setPhase("cesium");           // recién aquí pasas al mapa
          }}
        />
      )}


      {/* Mapa Cesium */}
      {phase === "cesium" && (
        <>
          <CesiumGlobe
            started={true}
            geojson={null}
            onPick={handlePickOnGlobe}
          />
          <Controls
            lat={selected.lat}
            lon={selected.lon}
            diameter_m={meteor.diameter_m}
            velocity_kms={meteor.velocity_kms}
            mass_kg={meteor.mass_kg}
            isCustom={isCustom}
            selectedAsteroidId={selectedAsteroidId}
            onDone={() => {
              alert("Simulación completada ✅");
              setPhase("menu");
            }}
            onBack={() => setPhase("menu")} // ✅ ahora sí vuelve al menú
          />
        </>
      )}
    </>
  );
}
