import AsteroidTable from "./AsteroidTable";

type Props = {
  onBack: () => void;
  // 👇 NUEVO: prop para notificar el id seleccionado en la tabla
  onSelectAsteroid: (id: number) => void;
};

export default function RequestsPanel({ onBack, onSelectAsteroid }: Props) {
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
          }}
        >
          <button className="btn small" onClick={onBack}>
            ← Volver
          </button>
          <h2>Asteroides cercanos</h2>
        </div>

        {/* 👇 Pasamos el handler para “levantar” el id al App */}
        <AsteroidTable onSelect={(a) => onSelectAsteroid(a.id)} />
      </div>
    </div>
  );
}
