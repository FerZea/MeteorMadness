import React, { useEffect, useState } from "react";

/** 
 * Estructura esperada de la respuesta del backend
 */
type SimulationResult = {
  simulation: {
    energy_in_megatons: number;
    impact_velocity: number;
    crater_diameter_m: number;
    crater_depth_m: number;
  };
  seismic_magnitude: number;
  related_earthquake: {
    id: string;
    magnitude: number;
    location: string;
    time_utc: string;
    longitude: number;
    latitude: number;
    depth_km: number;
  } | null;
};

// Endpoint local de la API
const DEFAULT_GET = "http://192.168.100.32:8000/api/impact/combined";

/**
 * Componente que muestra la información de la simulación actual.
 * - Hace una petición GET al backend cuando se monta.
 * - Muestra mensajes de carga, error y los resultados.
 */
export default function SimulatorInfo() {
  const [data, setData] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Efecto: obtener los datos del backend al montar el componente
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(DEFAULT_GET);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: SimulationResult = await res.json();

        console.log("✅ Datos recibidos del backend:", json);
        if (mounted) setData(json);
      } catch (err: any) {
        console.error("❌ Error al obtener datos:", err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Estados de carga y error
  if (loading) return <div style={{ color: "#aaa" }}>Cargando resultados de simulación…</div>;
  if (error) return <div style={{ color: "#b00020" }}>Error: {error}</div>;
  if (!data) return <div style={{ color: "#aaa" }}>No hay datos disponibles.</div>;

  const { simulation, seismic_magnitude, related_earthquake } = data;

  return (
    <div
      style={{
        color: "#fff",
        background: "rgba(255,255,255,0.05)",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>Resultados de la simulación</h3>

      <ul style={{ listStyle: "none", paddingLeft: 0, lineHeight: 1.6 }}>
        <li><b>Energía liberada:</b> {simulation.energy_in_megatons.toLocaleString()} megatones</li>
        <li><b>Velocidad de impacto:</b> {simulation.impact_velocity.toLocaleString()} km/s</li>
        <li><b>Diámetro del cráter:</b> {simulation.crater_diameter_m.toLocaleString()} m</li>
        <li><b>Profundidad del cráter:</b> {simulation.crater_depth_m.toLocaleString()} m</li>
        <li><b>Magnitud sísmica:</b> {seismic_magnitude}</li>
      </ul>

      {/* Datos del sismo relacionado, solo si existen */}
      {related_earthquake && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: "rgba(255,255,255,0.07)",
          }}
        >
          <h4 style={{ margin: "4px 0" }}>Sismo relacionado</h4>
          <ul style={{ listStyle: "none", paddingLeft: 0, lineHeight: 1.6 }}>
            <li><b>ID:</b> {related_earthquake.id}</li>
            <li><b>Magnitud:</b> {related_earthquake.magnitude}</li>
            <li><b>Ubicación:</b> {related_earthquake.location}</li>
            <li><b>Fecha (UTC):</b> {related_earthquake.time_utc}</li>
            <li><b>Coordenadas:</b> {related_earthquake.latitude}, {related_earthquake.longitude}</li>
            <li><b>Profundidad:</b> {related_earthquake.depth_km} km</li>
          </ul>
        </div>
      )}
    </div>
  );
}