// src/components/MeteorPreview.tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// ✅ IMPORTA LAS URLS RESUELTAS POR VITE DESDE /public
// (si están en public/textures/..., empieza con "/textures/..." y añade ?url)
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

  // ✅ usa las URLs importadas
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
        metalness={0.05}
      />
    </mesh>
  );
}

function OrbitalMeteor({ diameter, velocity }: Props) {
  const orbitRef = useRef<THREE.Group>(null);

  const orbitRadius = useMemo(() => {
    const base = Math.max(3, diameter / 25);
    return THREE.MathUtils.clamp(base, 3, 20);
  }, [diameter]);

  useFrame((_, dt) => {
    if (!orbitRef.current) return;
    const orbitalSpeed = 0.1 + velocity * 0.01;
    orbitRef.current.rotation.y += dt * orbitalSpeed;
    const t = performance.now() * 0.001;
    orbitRef.current.position.y = Math.sin(t) * 0.2;
  });

  return (
    <group ref={orbitRef}>
      <group position={[orbitRadius, 0, 0]}>
        <MeteorMesh diameter={diameter} velocity={velocity} />
      </group>
    </group>
  );
}

export default function MeteorPreview({ diameter, velocity }: Props) {
  return (
    <div style={{ width: "100%", height: 360, background: "#000", borderRadius: 12 }}>
      <Canvas shadows camera={{ position: [0, 2.2, 7], fov: 45 }}>
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={<Html center style={{ color: "#fff" }}>Cargando meteorito…</Html>}>
          <Stars radius={100} depth={50} count={8000} factor={2} saturation={0} fade speed={0.25} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-8, -2, -6]} intensity={0.35} color={"#6ea7ff"} />
          <OrbitalMeteor diameter={diameter} velocity={velocity} />
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
