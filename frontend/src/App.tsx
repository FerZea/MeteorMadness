import { useEffect, useState } from "react";
import LoadingOverlay from "./components/LoadingOverlay";
import StartScreen from "./components/StartScreen";
import MainMenu from "./components/MainMenu";
import CustomMeteorPanel from "./components/CustomMeteorPanel";
import RequestsPanel from "./components/RequestsPanel";
import CesiumGlobe from "./components/CesiumGlobe";
import Controls from "./components/Controls";

type Phase =
  | "loading"
  | "gate"
  | "menu"
  | "custom"
  | "requests"
  | "cesium";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");

  // Estado del meteorito
  const [meteor, setMeteor] = useState({
    diameter_m: 120,
    velocity_kms: 18.5,
    mass_kg: 5000,
  });

  // Coordenadas seleccionadas en Cesium
  const [selected, setSelected] = useState<{ lat?: number; lon?: number }>({});

  // Simulación de carga inicial
  useEffect(() => {
    const t = setTimeout(() => setPhase("gate"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Pantalla de carga */}
      {phase === "loading" && <LoadingOverlay text="Cargando recursos…" />}

      {/* Pantalla inicial */}
      {phase === "gate" && <StartScreen onStart={() => setPhase("menu")} />}

      {/* Menú principal */}
      {phase === "menu" && (
        <MainMenu
          onCustom={() => setPhase("custom")}
          onRequests={() => setPhase("requests")}
        />
      )}

      {/* Pantalla: meteorito personalizado */}
      {phase === "custom" && (
        <CustomMeteorPanel
          onBack={() => setPhase("menu")}
          onOpenCesium={(diameter, velocity, masa) => {
          setMeteor({
            diameter_m: diameter,
            velocity_kms: velocity,
            mass_kg: masa,
      });
      setPhase("cesium");
    }}
  />
)}


      {/* Pantalla: solicitudes */}
      {phase === "requests" && (
        <RequestsPanel onBack={() => setPhase("menu")} />
      )}

      {/* Pantalla: mapa Cesium */}
      {phase === "cesium" && (
        <>
          <CesiumGlobe
            started={true}
            geojson={null}
            onPick={({ lat, lon }) => setSelected({ lat, lon })}
          />
          <Controls
            lat={selected.lat}
            lon={selected.lon}
            diameter_m={meteor.diameter_m}
            velocity_kms={meteor.velocity_kms}
            mass_kg={meteor.mass_kg}
            onDone={() => {
              alert("Simulación completada ✅");
              setPhase("menu");
            }}
          />
          <button
            className="btn"
            style={{
              position: "fixed",
              left: 16,
              bottom: 16,
              zIndex: 100,
              background: "#222",
              color: "#fff",
            }}
            onClick={() => setPhase("menu")}
          >
            ← Volver al menú
          </button>
        </>
      )}
    </>
  );
}
