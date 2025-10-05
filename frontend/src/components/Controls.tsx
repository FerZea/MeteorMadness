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
  onDone?: (result: unknown) => void;
};

export default function Controls({
  lat,
  lon,
  diameter_m,
  velocity_kms,
  mass_kg,
  onDone,
}: Props) {
  const [busy, setBusy] = useState(false);
  const canFire = typeof lat === "number" && typeof lon === "number" && !busy;

  const handleFire = async () => {
    if (!canFire) return;
    setBusy(true);
    try {
      const res = await postMeteorImpact({
        lat: lat!,
        lon: lon!,
        diameter_m,
        velocity_kms,
        mass_kg,
      });
      onDone?.(res);
      alert("Impacto enviado con éxito ✅");
    } catch (err: any) {
      console.error(err);
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
