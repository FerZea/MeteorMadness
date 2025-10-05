import { useEffect, useState } from "react";
import LoadingOverlay from "./components/LoadingOverlay";
import StartScreen from "./components/StartScreen";
import MainMenu from "./components/MainMenu";
import CustomMeteorPanel from "./components/CustomMeteorPanel";
import RequestsPanel from "./components/RequestsPanel";

type Phase = "loading" | "gate" | "menu" | "custom" | "requests";

export default function App() {
  const [phase, setPhase] = useState<Phase>("loading");

  // “Carga real” simulada: aquí luego puedes poner fetch/config inicial
  useEffect(() => {
    const t = setTimeout(() => setPhase("gate"), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {phase === "loading" && <LoadingOverlay text="Cargando recursos…" />}

      {phase === "gate" && (
        <StartScreen onStart={() => setPhase("menu")} />
      )}

      {phase === "menu" && (
        <MainMenu
          onCustom={() => setPhase("custom")}
          onRequests={() => setPhase("requests")}
        />
      )}

      {phase === "custom" && (
        <CustomMeteorPanel onBack={() => setPhase("menu")} />
      )}

      {phase === "requests" && (
        <RequestsPanel onBack={() => setPhase("menu")} />
      )}
    </>
  );
}
