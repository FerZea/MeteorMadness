// ...tus imports
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

  // 👇 NUEVO: id seleccionado en la tabla
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<number | null>(null);

  // Estado del meteorito (como ya lo tenías)
  const [meteor, setMeteor] = useState({
    diameter_m: 120,
    velocity_kms: 18.5,
    mass_kg: 5000,
  });

  // Coordenadas seleccionadas en Cesium
  const [selected, setSelected] = useState<{ lat?: number; lon?: number }>({});

  useEffect(() => {
    const t = setTimeout(() => setPhase("gate"), 1200);
    return () => clearTimeout(t);
  }, []);

  // 👇 Handler para postear cuando se hace pick en el globo
  const handlePickOnGlobe = async ({ lat, lon }: { lat: number; lon: number }) => {
    setSelected({ lat, lon });
    if (!selectedAsteroidId) {
      alert("Selecciona primero un asteroide en la lista.");
      return;
    }
    try {
      const res = await fetch("http://192.168.100.32:8000/api/nasa/asteroid-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedAsteroidId, lat, lon }), // 👈 solo id + coords
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // opcional: notificación/estado
      console.log("POST OK", { id: selectedAsteroidId, lat, lon });
    } catch (err) {
      console.error("POST error", err);
      alert("No se pudo enviar la selección al backend.");
    }
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

      {phase === "custom" && (
        <CustomMeteorPanel
          onBack={() => setPhase("menu")}
          onOpenCesium={(diameter, velocity, masa) => {
            setMeteor({ diameter_m: diameter, velocity_kms: velocity, mass_kg: masa });
            setPhase("cesium");
          }}
        />
      )}

      {phase === "requests" && (
        <RequestsPanel
          onBack={() => setPhase("menu")}
          // 👇 cuando el usuario da click en una fila de la tabla:
          onSelectAsteroid={(id) => {
            setSelectedAsteroidId(id);
            setPhase("cesium"); // nos vamos directo al globo
          }}
        />
      )}

      {phase === "cesium" && (
        <>
          <CesiumGlobe
            started={true}
            geojson={null}
            // 👇 al hacer click en el globo posteamos con el id guardado
            onPick={handlePickOnGlobe}
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
            style={{ position: "fixed", left: 16, bottom: 16, zIndex: 100, background: "#222", color: "#fff" }}
            onClick={() => setPhase("menu")}
          >
            ← Volver al menú
          </button>
        </>
      )}
    </>
  );
}
