import React, { useMemo } from "react";
import CesiumGlobe, { CesiumGlobeProps } from "./CesiumGlobe";

/** Estructura sugerida para lo que regresa tu backend (ajústala a tu API real) */
export type ImpactBackendResult = {
  magnitude?: number;            // Mercalli o equivalente
  energy_megatons?: number;      // Energía liberada
  crater_diameter_km?: number;   // Diámetro de cráter estimado
  impact_radius_km?: number;     // Radio afectación (onda, daños, etc.)
  summary?: string;              // Texto descriptivo
  [k: string]: any;              // Campos extra
};

export type ImpactReviewOverlayProps = {
  open: boolean;   // visible u oculto
  onClose: () => void;

  // Datos que hoy le pasas a Controls:
  lat: number;
  lon: number;
  diameter_km: number;
  velocity_kms: number;
  mass_kg: number;
  isCustom: boolean;
  selectedAsteroidId: number | null;

  // Datos devueltos por backend (puedes pasar todo el JSON)
  backend?: ImpactBackendResult;
};

/** Construye un círculo geodésico (Polygon GeoJSON) centrado en lat/lon con radio en km */
function makeCirclePolygonGeoJSON(latDeg: number, lonDeg: number, radiusKm: number, steps = 128) {
  const R = 6371.0; // radio terrestre (km)
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const d = radiusKm / R;

  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const brng = (2 * Math.PI * i) / steps;
    const lat2 = Math.asin(
      Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng)
    );
    const lon2 =
      lon +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat),
        Math.cos(d) - Math.sin(lat) * Math.sin(lat2)
      );
    coords.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [coords],
    },
    properties: {
      name: `Impact radius ${radiusKm} km`,
    },
  };
}

/** Punto del epicentro */
function makePointFeature(lat: number, lon: number) {
  return {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [lon, lat] as [number, number] },
    properties: { name: "Impact point" },
  };
}

export default function ImpactReviewOverlay({
  open,
  onClose,
  lat,
  lon,
  diameter_km,
  velocity_kms,
  mass_kg,
  isCustom,
  selectedAsteroidId,
  backend,
}: ImpactReviewOverlayProps) {
  // radio de impacto a mostrar (preferimos el del backend si llega)
  const impactRadiusKm = backend?.impact_radius_km ?? backend?.crater_diameter_km
    ? (backend!.crater_diameter_km! / 2)
    : Math.max(2, diameter_km * 1.8); // fallback simple

  // GeoJSON con círculo y punto
  const impactGeoJson = useMemo(() => {
    const circle = makeCirclePolygonGeoJSON(lat, lon, impactRadiusKm);
    const point = makePointFeature(lat, lon);
    return {
      type: "FeatureCollection" as const,
      features: [circle, point],
    };
  }, [lat, lon, impactRadiusKm]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        background: "rgba(6,10,18,0.88)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Panel lateral con datos */}
      <aside
        style={{
          padding: 16,
          color: "white",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Impact review</h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.4)",
              color: "white",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>

        <div style={{ height: 12 }} />

        {/* Datos base */}
        <Card title="Input">
          <Field label="Mode" value={isCustom ? "Custom meteor" : "From NASA list"} />
          {!isCustom && <Field label="Asteroid ID" value={String(selectedAsteroidId ?? "—")} />}
          <Field label="Latitude" value={lat.toFixed(4)} />
          <Field label="Longitude" value={lon.toFixed(4)} />
          <Field label="Diameter (km)" value={diameter_km.toLocaleString()} />
          <Field label="Velocity (km/s)" value={velocity_kms.toLocaleString()} />
          <Field label="Mass (kg)" value={mass_kg.toLocaleString()} />
        </Card>

        {/* Resultados backend */}
        <Card title="Backend result">
          <Field label="Magnitude" value={fmtNum(backend?.magnitude)} />
          <Field label="Energy (Mt TNT)" value={fmtNum(backend?.energy_megatons)} />
          <Field label="Crater diameter (km)" value={fmtNum(backend?.crater_diameter_km)} />
          <Field label="Impact radius (km)" value={fmtNum(backend?.impact_radius_km ?? impactRadiusKm)} />
          {backend?.summary && (
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85, lineHeight: 1.35 }}>
              {backend.summary}
            </div>
          )}
        </Card>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          * The impact radius is drawn on the map on the right.
        </div>
      </aside>

      {/* Mapa Cesium con círculo de impacto */}
      <div style={{ position: "relative" }}>
        <CesiumGlobe started={true} geojson={impactGeoJson} />
        {/* Etiqueta flotante */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            color: "white",
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "8px 10px",
            fontSize: 13,
          }}
        >
          Impact radius shown: <strong>{impactRadiusKm.toLocaleString()} km</strong>
        </div>
      </div>
    </div>
  );
}

/* --------------------- UI helpers --------------------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        margin: "12px 0",
        padding: 12,
        display: "grid",
        gap: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        color: "white",
      }}
    >
      <div style={{ opacity: 0.9, fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 8,
        alignItems: "center",
        fontSize: 14,
      }}
    >
      <span style={{ opacity: 0.75 }}>{label}</span>
      <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{String(value)}</code>
    </div>
  );
}

function fmtNum(n: number | undefined) {
  if (n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString();
}
