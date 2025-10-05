import { useState } from "react";
import ImpactReviewOverlay, { ImpactBackendResult } from "./ImpactReviewOverlay";

type Props = {
  lat?: number;
  lon?: number;
  diameter_km: number;
  velocity_kms: number;
  mass_kg: number;
  isCustom: boolean;
  selectedAsteroidId: number | null;
  onDone?: (result: unknown) => void;
  onBack?: () => void;
};

export default function Controls({
  lat,
  lon,
  diameter_km,
  velocity_kms,
  mass_kg,
  isCustom,
  selectedAsteroidId,
  onDone,
  onBack,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [result, setResult] = useState<ImpactBackendResult | undefined>(undefined);

  const canFire = typeof lat === "number" && typeof lon === "number" && !busy;

  /** Envía datos al backend y abre la vista de resultados */
  const postImpact = async () => {
    if (typeof lat !== "number" || typeof lon !== "number") return;

    const POST_URL = "http://192.168.100.32:8000/api/nasa/input";
    let payload: Record<string, any>;

    if (isCustom) {
      payload = { is_custom: true, lat, lon, diameter_km, velocity_kms, mass_kg };
    } else {
      if (!selectedAsteroidId) {
        alert("First select an asteroid from the list.");
        return;
      }
      payload = { is_custom: false, nasa_id: selectedAsteroidId, lat, lon };
    }

    try {
      setBusy(true);
      const res = await fetch(POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ImpactBackendResult = await res.json();

      setResult(data);
      setReviewOpen(true);
      onDone?.(data);
    } catch (err) {
      console.error("POST error", err);
      alert("Error sending impact ❌");
    } finally {
      setBusy(false);
    }
  };

  /** Inicia el proceso de simulación → directamente muestra resultados */
  const startSimulation = async () => {
    if (!canFire) {
      alert("Click on the globe to choose a location first.");
      return;
    }
    await postImpact();
  };

  return (
    <>
      {/* Overlay con la vista de resultados del impacto */}
      {typeof lat === "number" && typeof lon === "number" && (
        <ImpactReviewOverlay
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          lat={lat}
          lon={lon}
          diameter_km={diameter_km}
          velocity_kms={velocity_kms}
          mass_kg={mass_kg}
          isCustom={isCustom}
          selectedAsteroidId={selectedAsteroidId}
          backend={result}
        />
      )}

      {/* PANEL DERECHO */}
      <aside
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 320,
          padding: 16,
          background: "rgba(10, 15, 25, 0.85)",
          backdropFilter: "blur(8px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          color: "white",
          zIndex: 30,
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        <h3 style={{ margin: "4px 0 12px 0" }}>Panel de control</h3>

        <section
          style={{
            display: "grid",
            gap: 8,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ opacity: 0.8, fontSize: 12 }}>Mode</span>
            <strong>{isCustom ? "Custome Meteorite" : "Select from the list"}</strong>
          </label>

          {isCustom ? (
            <>
              <Field label="Diameter (km)" value={diameter_km.toLocaleString()} />
              <Field label="Velocity (km/s)" value={velocity_kms.toLocaleString()} />
              <Field label="Mass (kg)" value={mass_kg.toLocaleString()} />
            </>
          ) : (
            <Field label="Asteroide" value={selectedAsteroidId ?? "—"} />
          )}

          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <small style={{ opacity: 0.8 }}>Coordinates</small>
            <div style={{ marginTop: 6 }}>
              {typeof lat === "number" && typeof lon === "number" ? (
                <code style={{ fontSize: 13 }}>
                  lat: {lat.toFixed(4)} • lon: {lon.toFixed(4)}
                </code>
              ) : (
                <span style={{ opacity: 0.8 }}>Click to Select Coords</span>
              )}
            </div>
          </div>
        </section>

       

        <div style={{ height: 80 }} />
      </aside>

      {/* BOTONES INFERIORES */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        {!canFire && (
          <span
            style={{
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,.6)",
              fontSize: 13,
              background: "rgba(0,0,0,0.4)",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Click on the globe to choose location
          </span>
        )}

        {/* Botón Volver (siempre visible) */}
        <button
          onClick={onBack ?? (() => console.log("Volver presionado (sin acción definida)"))}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.45)",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        >
          ← Back
        </button>

        {/* Botón principal */}
        <button
          className="btn btn-primary"
          onClick={startSimulation}
          disabled={!canFire || busy}
          title={
            canFire
              ? "Enviar impacto y mostrar resultados"
              : "Haz clic en el mapa para elegir ubicación"
          }
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: canFire && !busy ? "#2563eb" : "#334155",
            color: "white",
            cursor: canFire && !busy ? "pointer" : "not-allowed",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {busy ? "Cargando…" : "🚀 Start simulation"}
        </button>
      </div>
    </>
  );
}

/** Campo informativo reutilizable */
function Field({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10,
        padding: "8px 10px",
      }}
    >
      <div style={{ opacity: 0.8, fontSize: 12 }}>{label}</div>
      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{value}</div>
    </div>
  );
}
