import { useState } from "react";
import MeteorPreview from "./MeteorPreview";

type Props = { 
  onBack: () => void;
  onOpenCesium: (diameter: number, velocity: number, masa: number) => void;
};


export default function CustomMeteorPanel({ onBack, onOpenCesium }: Props) {
  const [diameter, setDiameter] = useState(120);
  const [velocity, setVelocity] = useState(18.5);
  const [masa, setMasa] = useState(5000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Simular meteorito:\nMasa = ${masa} kg\nDiámetro = ${diameter} m\nVelocidad = ${velocity} km/s`
    );
  };

  return (
    <div className="screen center">
      <div className="card" style={{ width: "min(980px, 95vw)" }}>
        {/* Botón volver */}
        <div className="row" style={{ marginBottom: 8 }}>
          <button className="btn small" onClick={onBack}>← Volver</button>
        </div>

        <h2 style={{ marginTop: 0 }}>Meteorito personalizado</h2>

        <div className="row" style={{ alignItems: "flex-start" }}>
          {/* Columna izquierda: formulario */}
          <form className="form" onSubmit={handleSubmit} style={{ flex: "1 1 360px" }}>
            <label>
              Diámetro (m)
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(Math.max(1, +e.target.value))}
              />
            </label>

            <label>
              Velocidad (km/s)
              <input
                type="number"
                step="0.1"
                value={velocity}
                onChange={(e) => setVelocity(Math.max(0, +e.target.value))}
              />
            </label>

            <label>
              Masa (kg)
              <input
                type="number"
                step="0.1"
                value={masa}
                onChange={(e) => setMasa(Math.max(0, +e.target.value))}
              />
            </label>

            <div className="row">
              <button className="btn btn-primary" type="submit">Simular</button>
              <button className="btn" type="button" onClick={onBack}>Cancelar</button>
            </div>

            {/* 👇 Nuevo botón para abrir Cesium */}
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                type="button"
                onClick={() => onOpenCesium(diameter, velocity, masa)}
              >
                Ver en mapa 🌍
              </button>

            </div>
          </form>

          {/* Columna derecha: preview 3D */}
          <div style={{ flex: "1 1 360px", minWidth: 320 }}>
            <MeteorPreview diameter={diameter} velocity={velocity} />
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
              Vista previa — la escala y el color cambian según los valores.
              <br />Arrastra para rotar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
