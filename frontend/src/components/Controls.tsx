// src/components/Controls.tsx
import { useState } from "react";
import { postMeteorImpact } from "../api/client";

type Props = {
  /** Coordenadas elegidas en el globo */
  lat?: number;
  lon?: number;
  /** Parámetros físicos del meteorito (vienen de tu panel previo) */
  diameter_m: number;
  velocity_kms: number;
  mass_kg: number;
  isCustom: boolean;
  selectedAsteroidId: number | null;
  onDone?: (result: unknown) => void;
};

export default function Controls({
  lat,
  lon,
  diameter_m,
  velocity_kms,
  mass_kg,
  isCustom,
  selectedAsteroidId,
  onDone,
}: Props) {
  const [busy, setBusy] = useState(false);
  const canFire = typeof lat === "number" && typeof lon === "number" && !busy;

  const handleFire = async () => {
  if (!canFire) return;
  setBusy(true);

  const POST_URL = "http://192.168.100.32:8000/api/nasa/input";

  let payload: Record<string, any>;

  if (isCustom) {
    payload = {
      is_custom: true,
      lat,
      lon,
      diameter_m,
      velocity_kms,
      mass_kg,
    };
  } else {
    if (!selectedAsteroidId) {
      alert("Selecciona primero un asteroide en la lista.");
      setBusy(false);
      return;
    }
    payload = { is_custom: false, id: selectedAsteroidId, lat, lon };
  }

  try {
    const res = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("POST OK", payload);
    alert("Impacto enviado con éxito ✅");
    onDone?.(await res.json());
  } catch (err: any) {
    console.error("POST error", err);
    alert("Error al enviar el impacto ❌");
  } finally {
    setBusy(false);
  }
};

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 20,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <button
        className="btn btn-primary"
        disabled={!canFire}
        onClick={handleFire}
        title={canFire ? "Enviar impacto" : "Haz click en el mapa para elegir ubicación"}
      >
        {busy ? "Enviando…" : "🚀 Lanzar meteorito"}
      </button>
      {!canFire && (
        <span style={{ color: "white", textShadow: "0 1px 2px rgba(0,0,0,.6)" }}>
          Click en el mapa para elegir ubicación
        </span>
      )}
    </div>
  );
}
