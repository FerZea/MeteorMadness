import { useEffect, useRef } from "react"
import * as Cesium from "cesium"

const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined

type Props = {
  started: boolean         // inicializa el viewer
  visible: boolean         // muestra/oculta el canvas sin destruir
  geojson: any | null
  onTilesLoaded?: () => void
  onFirstRender?: () => void
}

export default function CesiumGlobe({
  started,
  visible,
  geojson,
  onTilesLoaded,
  onFirstRender,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)

  useEffect(() => {
    if (!started || !rootRef.current || viewerRef.current) return

    if (ionToken) Cesium.Ion.defaultAccessToken = ionToken

    const viewer = new Cesium.Viewer(rootRef.current, {
      terrain: ionToken ? Cesium.Terrain.fromWorldTerrain() : undefined,
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    })
    viewerRef.current = viewer

    // ---- IMAGERY: Ion World Imagery si hay token, OSM fallback ----
    ;(async () => {
      let imagery: Cesium.ImageryProvider
      try {
        if (ionToken) {
          imagery = await Cesium.createWorldImageryAsync({
            style: Cesium.IonWorldImageryStyle.AERIAL,
          })
        } else {
          imagery = new Cesium.OpenStreetMapImageryProvider({
            url: "https://a.tile.openstreetmap.org/",
          })
        }
      } catch (e) {
        console.warn("[Cesium] imagery error, fallback OSM", e)
        imagery = new Cesium.OpenStreetMapImageryProvider({
          url: "https://a.tile.openstreetmap.org/",
        })
      }

      // Espera a readyPromise si existe
      if ((imagery as any).readyPromise) {
        try { await (imagery as any).readyPromise } catch {}
      }

      viewer.scene.imageryLayers.removeAll()
      viewer.scene.imageryLayers.addImageryProvider(imagery)

      // Calidad
      viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 2)
      viewer.scene.postProcessStages.fxaa.enabled = true
      if ((viewer.scene as any).context?.msaaSupported) {
        ;(viewer.scene as any).msaaSamples = 4
      }
      viewer.scene.globe.maximumScreenSpaceError = 1.6
      viewer.scene.globe.enableLighting = false
      viewer.scene.globe.showGroundAtmosphere = true

      // Primer frame
      const firstRender = () => {
        onFirstRender?.()
        viewer.scene.postRender.removeEventListener(firstRender)
      }
      viewer.scene.postRender.addEventListener(firstRender)

      // ---- FIN DE CARGA CON FALLBACK ----
      let done = false
      const markDone = (reason: string) => {
        if (!done) {
          done = true
          console.log("[Cesium] tiles loaded:", reason)
          onTilesLoaded?.()
        }
      }

      // 1) Evento oficial
      const onTileProgress = (pending: number) => {
        // console.log("pending tiles:", pending)
        if (pending === 0) {
          viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onTileProgress)
          markDone("tileLoadProgressEvent==0")
        }
      }
      viewer.scene.globe.tileLoadProgressEvent.addEventListener(onTileProgress)

      // 2) Fallback por si el evento nunca llega a 0 (red lenta / provider raro)
      const fallback1 = setTimeout(() => markDone("fallback 3s"), 3000)
      const fallback2 = setTimeout(() => markDone("fallback 6s"), 6000)

      // Cámara
      viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(0, 0, 40_000_000) })
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-102, 23.6, 2_000_000),
        duration: 2.6,
        easingFunction: Cesium.EasingFunction.QUADRATIC_OUT,
      })

      const onResize = () => viewer.resize()
      window.addEventListener("resize", onResize)
      requestAnimationFrame(onResize)

      // Limpieza
      ;(viewer as any)._cleanup = () => {
        window.removeEventListener("resize", onResize)
        try {
          viewer.scene.globe.tileLoadProgressEvent.removeEventListener(onTileProgress)
        } catch {}
        clearTimeout(fallback1)
        clearTimeout(fallback2)
        try { viewer.destroy() } catch {}
        viewerRef.current = null
      }
    })()

    return () => {
      ;(viewerRef.current as any)?._cleanup?.()
    }
  }, [started, onTilesLoaded, onFirstRender])

  // GeoJSON
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !geojson) return

    viewer.dataSources.removeAll()
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true,
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.fromAlpha(Cesium.Color.RED, 0.35),
    })
      .then((ds) => {
        viewer.dataSources.add(ds)
        viewer.flyTo(ds)
        URL.revokeObjectURL(url)
        viewer.scene.requestRender()
      })
      .catch(() => URL.revokeObjectURL(url))
  }, [geojson])

  return (
    <div
      ref={rootRef}
      style={{
        width: "100%",
        height: "100vh",
        display: visible ? "block" : "none",
      }}
    />
  )
}
