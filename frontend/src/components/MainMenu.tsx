import { useState } from "react";
import MeteorPreview from "./MeteorPreview";

type Props = {
  onCustom: () => void;
  onRequests: () => void;
};

export default function MainMenu({ onCustom, onRequests }: Props) {
  // Valores de ejemplo para el preview (puedes ajustarlos o hacerlos aleatorios)
  const [diameter] = useState(120); // m
  const [velocity] = useState(18.5); // km/s

  return (
    <div className="screen center">
      <div className="card" style={{ width: "min(980px, 95vw)" }}>
        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          🌠 Menú principal
        </h2>

        {/* Layout: preview a la izquierda, botones a la derecha (responsive) */}
        <div
          className="row"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 16,
          }}
        >
          {/* Columna izquierda: Meteorito en órbita */}
          <div>
            <MeteorPreview diameter={diameter} velocity={velocity} />
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              Vista previa — meteorito orbitando el centro de la escena.
            </div>
          </div>

          {/* Columna derecha: Botones del menú */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            <button className="btn btn-primary" onClick={onCustom}>
              🚀 Meteorito personalizado
            </button>

            <button className="btn btn-secondary" onClick={onRequests}>
              📩 Solicitudes de meteoritos
            </button>
          </div>
        </div>

        {/* Responsive fallback para pantallas estrechas */}
        <style>{`
          @media (max-width: 760px) {
            .card .row {
              display: flex !important;
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
<s></s>