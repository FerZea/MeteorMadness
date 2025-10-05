import { useEffect, useState } from "react";

type Props = { onBack: () => void };

export default function RequestsPanel({ onBack }: Props) {
  const [items, setItems] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulación de API; cambia luego por fetch('/api/meteor-names')
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) {
        // mock de datos
        setItems(["Apophis", "Bennu", "Ryugu", "Itokawa"]);
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="screen center">
      <div className="card">
        <div className="row" style={{ marginBottom: 8 }}>
          <button className="btn small" onClick={onBack}>
            ← Volver
          </button>
        </div>
        <h2>Solicitudes de meteoritos</h2>
        {!items && !error && <div className="spinner" />}
        {error && <p className="error">{error}</p>}
        {items && (
          <ul className="list">
            {items.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
