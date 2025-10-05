import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

type MeteorSimOverlayProps = {
  /** Muestra/oculta la animación */
  active: boolean;
  /** Llamado al terminar la animación (o al autodesmontarse) */
  onFinish?: () => void;

  /** Parámetros para escalar la apariencia (opcional) */
  diameter_km?: number;    // tamaño relativo del meteorito
  velocity_kms?: number;   // afecta duración
  mass_kg?: number;        // no se usa visualmente por ahora

  /** Texto opcional que se muestra en la esquina */
  label?: string;
};

/**
 * Overlay de animación (Three.js) que simula la caída de un meteorito.
 * Se dibuja por encima de Cesium y no intercepta eventos del mouse.
 */
export default function MeteorSimOverlay({
  active,
  onFinish,
  diameter_km = 0.12,   // si vienes con metros, adapta fuera
  velocity_kms = 18.5,
  mass_kg,
  label,
}: MeteorSimOverlayProps) {
  // Para un fundido (fade-in / fade-out) del overlay
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) setVisible(true);
  }, [active]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",   // no bloquear clics del globo
        zIndex: 60,              // por encima de tu UI
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // fondo transparente
        }}
      >
        {/* Iluminación muy simple */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 6, 8]} intensity={1.2} />

        {/* Fondo estrellado ultra-simple */}
        <StarField />

        {/* Meteorito + cola */}
        <Meteor
          diameter_km={diameter_km}
          velocity_kms={velocity_kms}
          onDone={() => {
            onFinish?.();
            // retraso pequeño para evitar parpadeos al desmontar
            setTimeout(() => setVisible(false), 50);
          }}
          playing={active}
        />
      </Canvas>

      {/* Etiqueta opcional arriba a la izquierda */}
      {label && (
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            color: "white",
            fontSize: 13,
            opacity: 0.8,
            textShadow: "0 2px 10px rgba(0,0,0,.6)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ------------------------ Partes internas ------------------------ */

function Meteor({
  diameter_km,
  velocity_kms,
  playing,
  onDone,
}: {
  diameter_km: number;
  velocity_kms: number;
  playing: boolean;
  onDone?: () => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const sphere = useRef<THREE.Mesh>(null!);
  const tail = useRef<THREE.Mesh>(null!);
  const heatMat = useRef<THREE.MeshStandardMaterial>(null!);
  const tailMat = useRef<THREE.MeshBasicMaterial>(null!);

  // tamaño relativo según diámetro (clamp para no romper)
  const size = useMemo(() => {
    const s = THREE.MathUtils.clamp(diameter_km / 1.5, 0.05, 0.8);
    return s;
  }, [diameter_km]);

  // duración relativa según velocidad (más rápido = menor duración)
  const duration = useMemo(() => {
    const base = 2.8; // segundos base
    const vFactor = THREE.MathUtils.clamp(25 / Math.max(velocity_kms, 1), 0.6, 1.8);
    return base * vFactor;
  }, [velocity_kms]);

  // punto de inicio y fin (coordenadas "de pantalla" en 3D)
  const start = useMemo<THREE.Vector3>(() => new THREE.Vector3(-4.2, 2.9, 0), []);
  const end   = useMemo<THREE.Vector3>(() => new THREE.Vector3(0.2, -2.5, -0.5), []);

  // cola: un cono estirado hacia atrás
  const [tailGeo] = useState(() => new THREE.ConeGeometry(0.2, 2.8, 16));
  const [sphereGeo] = useState(() => new THREE.SphereGeometry(1, 28, 18));

  const startTime = useRef<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!playing) return;
    startTime.current = null;
    setDone(false);
  }, [playing]);

  useFrame((state) => {
    if (!playing || done) return;
    const now = state.clock.elapsedTime;
    if (startTime.current === null) startTime.current = now;

    const t = (now - startTime.current) / duration; // 0..1
    if (t >= 1) {
      setDone(true);
      onDone?.();
      return;
    }

    // trayectoria suavizada (aceleración leve)
    const tt = easeOutCubic(t);

    // posición del meteorito
    const pos = new THREE.Vector3().lerpVectors(start, end, tt);
    group.current.position.copy(pos);

    // orientación (mira al vector de velocidad)
    const vel = new THREE.Vector3().subVectors(end, start).normalize();
    const lookAt = new THREE.Vector3().copy(pos).add(vel);
    group.current.lookAt(lookAt);
    group.current.rotateX(Math.PI / 2); // ajustar orientación del cono

    // escalar según tamaño
    group.current.scale.setScalar(size);

    // “calor” (emissive) según progreso
    const heat = THREE.MathUtils.lerp(0.5, 1.6, tt);
    heatMat.current.emissiveIntensity = heat;
    heatMat.current.color.setHSL(0.04 + 0.08 * tt, 1, 0.55);

    // cola: más larga y transparente al inicio → más corta al final
    const tailScale = THREE.MathUtils.lerp(1.4, 0.6, tt);
    tail.current.scale.set(1, tailScale, 1);
    tailMat.current.opacity = THREE.MathUtils.lerp(0.85, 0.2, tt);
  });

  return (
    <group ref={group}>
      {/* esfera incandescente */}
      <mesh ref={sphere} geometry={sphereGeo}>
        <meshStandardMaterial
          ref={heatMat}
          color={"#ffae00"}
          emissive={"#ff5200"}
          emissiveIntensity={1.2}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* cola (cono translucido) */}
      <mesh ref={tail} position={[0, -1.8, 0]} rotation={[Math.PI, 0, 0]} geometry={tailGeo}>
        <meshBasicMaterial
          ref={tailMat}
          color={"#ff6b00"}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Unos puntitos simulando estrellas, muy barato */
function StarField({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = THREE.MathUtils.randFloatSpread(20);
      arr[i * 3 + 1] = THREE.MathUtils.randFloatSpread(20);
      arr[i * 3 + 2] = -THREE.MathUtils.randFloat(2, 10);
    }
    return arr;
  }, [count]);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pos.length / 3}
          itemSize={3}
          array={pos}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.02} sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

/* ------------------------ Utils ------------------------ */

function easeOutCubic(x: number) {
  // acelera al inicio y frena suave al final
  return 1 - Math.pow(1 - x, 3);
}
