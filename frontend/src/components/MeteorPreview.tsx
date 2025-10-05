// src/components/MeteorPreview.tsx
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// ✅ IMPORTA LAS URLS RESUELTAS POR VITE DESDE /public
import diffuseUrl    from "/textures/meteor_diffuse.png?url";
import normalUrl     from "/textures/meteor_normal.png?url";
import roughnessUrl  from "/textures/meteor_roughness.png?url";

type Props = {
  diameter: number; // m
  velocity: number; // km/s
};

function MeteorMesh({ diameter, velocity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  const scale = useMemo(() => {
    const s = diameter / 50;
    return THREE.MathUtils.clamp(s, 0.2, 10);
  }, [diameter]);

  const [map, normalMap, roughnessMap] = useTexture([
    diffuseUrl,
    normalUrl,
    roughnessUrl,
  ]);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const spin = 0.25 + velocity * 0.02;
    meshRef.current.rotation.y += dt * spin;
    meshRef.current.rotation.x += dt * (spin * 0.35);
  });

  return (
    <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        map={map}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        roughness={0.95}
        metalness={0.02}
      />
    </mesh>
  );
}

/**
 * LinearMeteor
 * - Se mueve en línea recta hacia la derecha (eje X+).
 * - La cámara acompaña con suavizado y respeta una distancia mínima
 *   que depende del tamaño del meteorito (para que no lo atraviese).
 */
function LinearMeteor({ diameter, velocity }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // Dirección fija hacia la derecha (visible a X+)
  const direction = useMemo(() => new THREE.Vector3(1, 0, 0).normalize(), []);

  // Posición inicial (ligeramente a la izquierda para que se vea avanzar a la derecha)
  const startPos = useMemo(() => new THREE.Vector3(-12, 0, 0), []);

  // Velocidad lineal (en unidades/seg), ajustada por "velocity"
  const speed = useMemo(() => 0.8 + velocity * 0.06, [velocity]);

  // Cámara (seguimiento)
  const { camera } = useThree();

  // Offset base de cámara: un poco atrás (en -Z), arriba (Y+) y ligeramente detrás en X-
  // *No* se usa como valor absoluto: lo combinamos con la distancia mínima.
  const camBaseOffset = useRef(new THREE.Vector3(-1.25, 1.8, 3));

  // Distancia mínima a respetar según el tamaño del meteorito.
  // El radio aprox. del mesh es ~scale. Le damos un colchón extra.
  const minBackDistance = useMemo(() => {
    const scale = THREE.MathUtils.clamp(diameter / 50, 0.2, 10);
    return Math.max(3.0, scale * 0.3); // nunca menos de ~3u
  }, [diameter]);

  const desiredCamPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  // Inicializa posición del meteorito una vez
  useFrame(() => {
    if (!groupRef.current) return;
    if (groupRef.current.position.lengthSq() === 0) {
      groupRef.current.position.copy(startPos);
    }
  });

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    // 1) Movimiento lineal hacia la derecha (no se reinicia)
    const deltaMove = direction.clone().multiplyScalar(speed * dt);
    groupRef.current.position.add(deltaMove);

    // Bamboleo sutil para dar vida (opcional)
    const t = performance.now() * 0.001;
    groupRef.current.position.y = Math.sin(t * 0.7) * 0.2;

    // 2) CÁMARA: seguir y NO atravesar el objeto
    // Construimos una posición deseada:
    // - Atrasada respecto a la dirección en "minBackDistance"
    // - + un offset base para un encuadre más cinematográfico
    desiredCamPos.current
      .copy(groupRef.current.position)
      .addScaledVector(direction, -minBackDistance) // siempre detrás del meteorito según su tamaño
      .add(camBaseOffset.current);                   // ajuste lateral/vertical

    // Evita que la cámara se ponga "por delante" del meteorito:
    // Si el vector desde el meteoro hacia la cámara tiene proyección positiva
    // en "direction", empújala hacia atrás.
    const toCam = new THREE.Vector3().subVectors(desiredCamPos.current, groupRef.current.position);
    const ahead = toCam.dot(direction); // >0 significa que la cámara quedó por delante
    if (ahead > -0.25) {
      // empuja la cámara al menos "minBackDistance" detrás
      desiredCamPos.current
        .copy(groupRef.current.position)
        .addScaledVector(direction, -minBackDistance)
        .add(camBaseOffset.current);
    }

    // Suavizado del seguimiento
    camera.position.lerp(desiredCamPos.current, THREE.MathUtils.clamp(dt * 2.8, 0, 1));

    // Mirar hacia el meteoro
    lookAt.current.copy(groupRef.current.position);
    camera.lookAt(lookAt.current);
  });

  return (
    <group ref={groupRef}>
      <MeteorMesh diameter={diameter} velocity={velocity} />
    </group>
  );
}

export default function MeteorPreview({ diameter, velocity }: Props) {
  return (
    <div style={{ width: "100%", height: 360, background: "#000", borderRadius: 12 }}>
      {/* FOV amplio para dar sensación de desplazamiento */}
      <Canvas shadows camera={{ position: [0, 2.2, 7], fov: 90 }}>
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={<Html center style={{ color: "#fff" }}>Loading meteorite…</Html>}>
          <Stars radius={100} depth={50} count={8000} factor={2} saturation={0} fade speed={0.25} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-8, -2, -6]} intensity={0.35} color={"#6ea7ff"} />

          {/* Movimiento lineal a la derecha + cámara que no se deja atravesar */}
          <LinearMeteor diameter={diameter} velocity={velocity} />
        </Suspense>
      </Canvas>
    </div>
  );
}
