import { useState } from "react";
import AsteroidTable, { Asteroid } from "./AsteroidTable";

type Props = {
  onBack: () => void;
  onSimulate: (id: number) => void; // 👈 nuevo callback
};

export default function RequestsPanel({ onBack, onSimulate }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (a: Asteroid) => {
    setSelectedId(a.id);
  };

  return (
    <div className="screen center">
      <div className="card" style={{ width: "min(100%, 1000px)" }}>
        <div
          className="row"
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button className="btn small" onClick={onBack}>
            ← Back
          </button>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>
              {selectedId ? `Selected: #${selectedId}` : "Select an asteroid"}
            </span>
            <button
              className="btn"
              disabled={!selectedId}
              onClick={() => selectedId && onSimulate(selectedId)}
              title={selectedId ? "Simulate in the balloon" : "Select an asteroid first"}
            >
              ▶ Simulate
            </button>
          </div>
        </div>

        {/* Pasamos el handler y el id para resaltar la fila */}
        <AsteroidTable onSelect={handleSelect} selectedId={selectedId ?? undefined} />
        
      </div>
    </div>
  );
}
