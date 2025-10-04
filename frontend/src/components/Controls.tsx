import { useState } from 'react'

type Props = { onRun: (p: { lat: number; lon: number; diameter_m: number; velocity_kms: number }) => void; busy?: boolean }

export default function Controls({ onRun, busy }: Props) {
  const [lat, setLat] = useState(23.6)
  const [lon, setLon] = useState(-102.0)
  const [diameter, setDiameter] = useState(120)
  const [velocity, setVelocity] = useState(18.5)

  return (
    <div style={{ padding: 12, display: 'grid', gap: 8 }}>
      <label>Lat <input type="number" value={lat} onChange={e => setLat(+e.target.value)} /></label>
      <label>Lon <input type="number" value={lon} onChange={e => setLon(+e.target.value)} /></label>
      <label>Diameter (m) <input type="number" value={diameter} onChange={e => setDiameter(+e.target.value)} /></label>
      <label>Velocity (km/s) <input type="number" value={velocity} onChange={e => setVelocity(+e.target.value)} /></label>
      <button onClick={() => onRun({ lat, lon, diameter_m: diameter, velocity_kms: velocity })} disabled={busy}>
        {busy ? 'Simulando...' : 'Simular'}
      </button>
    </div>
  )
}
