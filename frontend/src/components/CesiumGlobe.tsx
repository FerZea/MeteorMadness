import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'

const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string

export default function CesiumGlobe({ geojson }: { geojson: any | null }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)

  useEffect(() => {
    if (!rootRef.current || viewerRef.current) return

    Cesium.Ion.defaultAccessToken = ionToken

    const viewer = new Cesium.Viewer(rootRef.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      timeline: false,
      baseLayerPicker: true,
    })
    viewerRef.current = viewer

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-102, 23.6, 2_000_000),
    })

    const resize = () => viewer.resize()
    requestAnimationFrame(resize)
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !geojson) return

    viewer.dataSources.removeAll()
    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true,
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.fromAlpha(Cesium.Color.RED, 0.35),
    }).then(ds => {
      viewer.dataSources.add(ds)
      viewer.flyTo(ds)
      URL.revokeObjectURL(url)
      viewer.resize()
    }).catch(() => URL.revokeObjectURL(url))
  }, [geojson])

  return <div ref={rootRef} className="cesium-root" />
}
