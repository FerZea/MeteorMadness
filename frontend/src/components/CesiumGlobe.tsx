// src/components/CesiumGlobe.tsx
import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export type CesiumGlobeProps = {
  started: boolean;
  geojson: any | null;
  onPick?: (pos: { lat: number; lon: number }) => void;
};

const CesiumGlobe: React.FC<CesiumGlobeProps> = ({ started, geojson, onPick }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const markerRef = useRef<Cesium.Entity | null>(null);
  const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);

  // Mantener siempre la última referencia a onPick SIN re-crear el viewer
  const onPickRef = useRef<typeof onPick>();
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  // Evitar doble init en React StrictMode (dev)
  const initializedRef = useRef(false);

  // Inicialización del viewer (NO depende de onPick)
  useEffect(() => {
    if (!started) return;
    if (initializedRef.current) return;               // ya inicializado
    if (!rootRef.current || viewerRef.current) return;

    initializedRef.current = true;

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

    viewer.scene.globe.depthTestAgainstTerrain = true;

    // Vista inicial solo una vez
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-102, 23.6, 2_000_000),
    });

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handlerRef.current = handler;

    // Helper para poner/actualizar marcador único
    const placeMarker = (lat: number, lon: number) => {
      const pos = Cesium.Cartesian3.fromDegrees(lon, lat); // (lon, lat)
      if (markerRef.current) {
        markerRef.current.position = pos as any;
        (markerRef.current.label!.text as any) = new Cesium.ConstantProperty(
          `Lat: ${lat.toFixed(4)}\nLon: ${lon.toFixed(4)}`
        );
      } else {
        markerRef.current = viewer.entities.add({
          position: pos,
          point: {
            pixelSize: 12,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `Lat: ${lat.toFixed(4)}\nLon: ${lon.toFixed(4)}`,
            font: "13px sans-serif",
            pixelOffset: new Cesium.Cartesian2(0, -18),
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            showBackground: true,
            backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
        });
      }
      viewer.scene.requestRender();
    };

    // Click izquierdo: colocar/actualizar marcador + notificar
    handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const scene = viewer.scene;
      const ray = viewer.camera.getPickRay(movement.position);
      if (!ray) return;
      const cartesian = scene.globe.pick(ray, scene);
      if (!cartesian) return;

      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lat = Cesium.Math.toDegrees(carto.latitude);
      const lon = Cesium.Math.toDegrees(carto.longitude);

      placeMarker(lat, lon);
      onPickRef.current?.({ lat, lon }); // usar ref, no depende del efecto
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Click derecho: eliminar marcador
    handler.setInputAction(() => {
      if (markerRef.current) {
        viewer.entities.remove(markerRef.current);
        markerRef.current = null;
        viewer.scene.requestRender();
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    const onResize = () => viewer.resize();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener("resize", onResize);
      if (handlerRef.current) {
        handlerRef.current.destroy();
        handlerRef.current = null;
      }
      try {
        if (viewerRef.current && markerRef.current) {
          viewerRef.current.entities.remove(markerRef.current);
        }
        viewer.destroy();
      } catch {}
      viewerRef.current = null;
      markerRef.current = null;
      initializedRef.current = false; // permitir re-init si el componente se desmonta realmente
    };
  }, [started]);

  // Carga GeoJSON (no afecta a entidades de marcador)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // si no hay geojson, no limpies dataSources innecesariamente
    if (!geojson) return;

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
        // flyTo del datasource, pero NO toques marker ni cámara base si no quieres “resetear”
        viewer.flyTo(ds);
        viewer.scene.requestRender();
      })
      .finally(() => URL.revokeObjectURL(url));
  }, [geojson]);

  return <div ref={rootRef} style={{ width: "100%", height: "100vh" }} />;
};

export default CesiumGlobe;
