const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function simulateImpact(params: {
  lat: number; lon: number; diameter_m: number; velocity_kms: number;
}) {
  const r = await fetch(`${API_BASE}/simulate/impact`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(params)
  })
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r.json()
}

// src/api/client.ts
export type ImpactRequest = {
  lat: number;
  lon: number;
  diameter_m: number;
  velocity_kms: number;
  mass_kg: number;
};

export async function postMeteorImpact(body: ImpactRequest) {
  const res = await fetch("/api/impacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /api/impacts ${res.status}: ${text}`);
  }
  return res.json().catch(() => ({}));
}
