import { useState } from "react";
import MeteorComparation from "./MeteorComparation";

type Props = {
  onBack: () => void;
  // ⛳️ Ahora todo en km: diameter_km
  onOpenCesium: (diameter_km: number, velocity_kms: number, masa_kg: number) => void;
};

// Helpers
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const fmt = (n: number) => (n >= 1000 ? n.toLocaleString("en-US") : String(n));

export default function CustomMeteorPanel({ onBack, onOpenCesium }: Props) {
  // 🔁 Todo en km
  const [diameterKm, setDiameterKm] = useState(10); // 0.12 km = 120 m
  const [velocity, setVelocity] = useState(20);     // km/s
  const [masa, setMasa] = useState(5000000);            // kg

  // Rango en km (1 m = 0.001 km … 1 km)
  const DIAM_MIN_KM = 0.1, DIAM_MAX_KM = 30, DIAM_STEP_KM = 0.1;
  const VEL_MIN = 0.1, VEL_MAX = 50, VEL_STEP = 0.1;
  const MASS_MIN = 100, MASS_MAX = 1000000000000, MASS_STEP = 100000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Simular meteorito:\n` +
      `Masa = ${fmt(masa)} kg\n` +
      `Diámetro = ${diameterKm.toFixed(3)} km\n` +
      `Velocidad = ${velocity.toFixed(1)} km/s`
    );
  };

  return (
    <div className="screen center">
      <div className="card" style={{ width: "min(980px, 95vw)" }}>
        {/* Volver */}
        <div className="row" style={{ marginBottom: 8 }}>
          <button className="btn small" onClick={onBack}>← Volver</button>
        </div>

        <h2 style={{ marginTop: 0 }}>Meteorito personalizado</h2>

        <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
          {/* Columna izquierda: formulario */}
          <form className="form" onSubmit={handleSubmit} style={{ flex: "1 1 360px", minWidth: 320 }}>
            {/* Diámetro (km) */}
            <label style={{ width: "100%" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>Diámetro (km)</span>
                <strong>{diameterKm.toFixed(3)} km</strong>
              </div>
              <input
                type="range"
                min={DIAM_MIN_KM}
                max={DIAM_MAX_KM}
                step={DIAM_STEP_KM}
                value={diameterKm}
                onChange={(e) => setDiameterKm(clamp(+e.target.value, DIAM_MIN_KM, DIAM_MAX_KM))}
              />
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                <span>{DIAM_MIN_KM.toFixed(3)} km</span>
                <span>{DIAM_MAX_KM.toFixed(3)} km</span>
              </div>
            </label>

            {/* Velocidad */}
            <label style={{ width: "100%" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>Velocidad (km/s)</span>
                <strong>{velocity.toFixed(1)} km/s</strong>
              </div>
              <input
                type="range"
                min={VEL_MIN}
                max={VEL_MAX}
                step={VEL_STEP}
                value={velocity}
                onChange={(e) => setVelocity(clamp(+e.target.value, VEL_MIN, VEL_MAX))}
              />
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                <span>{VEL_MIN} km/s</span>
                <span>{VEL_MAX} km/s</span>
              </div>
            </label>

            {/* Masa */}
            <label style={{ width: "100%" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>Masa (kg)</span>
                <strong>{fmt(masa)} kg</strong>
              </div>
              <input
                type="range"
                min={MASS_MIN}
                max={MASS_MAX}
                step={MASS_STEP}
                value={masa}
                onChange={(e) => setMasa(clamp(+e.target.value, MASS_MIN, MASS_MAX))}
              />
              <div className="row" style={{ justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                <span>{fmt(MASS_MIN)} kg</span>
                <span>{fmt(MASS_MAX)} kg</span>
              </div>
            </label>

            {/* Acciones */}
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" type="submit">Simular</button>
              <button className="btn" type="button" onClick={onBack}>Cancelar</button>
            </div>

            {/* Abrir Cesium (➡️ en km) */}
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                type="button"
                onClick={() => onOpenCesium(diameterKm, velocity, masa)}
              >
                Ver en mapa 🌍
              </button>
            </div>
          </form>

          {/* Columna derecha: preview 3D (➡️ en km) */}
          <div style={{ flex: "1 1 360px", minWidth: 320 }}>
            <MeteorComparation diameter={diameterKm} velocity={velocity} />
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
              Vista previa — la escala y la apariencia reaccionan a los valores (km).
              <br />Arrastra para rotar.
            </div>
          </div>
        </div>
      </div>

      {/* Estilos mínimos para los sliders (opcional) */}
      <style>{`
        input[type="range"] {
          width: 100%;
          appearance: none;
          height: 6px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--primary, #2563eb), var(--primary, #2563eb)) 0/0% 100% no-repeat, #1f1164ff;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--primary, #2563eb);
          cursor: pointer;
          margin-top: -6px;
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        input[type="range"] {
          --val: calc((var(--pos, 0) - var(--min, 0)) / (var(--max, 100) - var(--min, 0)) * 100%);
          background-size: var(--val, 0%) 100%;
        }
      `}</style>
    </div>
  );
}
