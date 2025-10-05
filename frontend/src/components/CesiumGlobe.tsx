// src/components/CesiumGlobe.tsx
import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

type Props = {
  started: boolean;
  geojson: any | null;
  /** Se llama cada vez que el usuario hace click en el globo */
  onPick?: (pos: { lat: number; lon: number }) => void;
};

export default function CesiumGlobe({ started, geojson, onPick }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const markerRef = useRef<Cesium.Entity | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);

  useEffect(() => {
    if (!started || !rootRef.current || viewerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
    if (token) Cesium.Ion.defaultAccessToken = token;

    const terrain = token ? Cesium.Terrain.fromWorldTerrain() : undefined;
    const viewer = new Cesium.Viewer(rootRef.current, {
      terrain,
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    });
    viewerRef.current = viewer;

    // Vista inicial
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-102, 23.6, 2_000_000),
    });

    // ——— Click para colocar marcador rojo ———
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handlerRef.current = handler;

    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const scene = viewer.scene;
      const ray = viewer.camera.getPickRay(movement.position);
      if (!ray) return;
      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      // Convertir a lat/lon
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);

      // Eliminar marcador previo si existe
      if (markerRef.current) viewer.entities.remove(markerRef.current);

      // Crear punto rojo
      const marker = viewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 12,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2
        },
        description: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`
      });
      markerRef.current = marker;

      onPick?.({ lat, lon }); //Enviar lat y lon a App.tsx
      scene.requestRender();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    const onResize = () => viewer.resize();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      try { viewer.destroy(); } catch {}
      viewerRef.current = null;
      markerRef.current = null;
    };
  }, [started]);

  // Carga GeoJSON si lo hay (opcional)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !geojson) return;

    viewer.dataSources.removeAll();
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    Cesium.GeoJsonDataSource.load(url, {
      clampToGround: true,
      stroke: Cesium.Color.WHITE,
      fill: Cesium.Color.fromAlpha(Cesium.Color.RED, 0.35),
    })
      .then((ds) => {
        viewer.dataSources.add(ds);
        viewer.flyTo(ds);
        viewer.scene.requestRender();
      })
      .finally(() => URL.revokeObjectURL(url));
  }, [geojson]);

  return <div ref={rootRef} style={{ width: "100%", height: "100vh" }} />;
}