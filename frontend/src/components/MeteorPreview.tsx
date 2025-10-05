// src/components/MeteorPreview.tsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  diameter: number;      // metros
  velocity: number;      // km/s
};

function MeteorMesh({ diameter, velocity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Mapear diámetro (m) -> escala de la escena (unidades Three)
  // Ajusta estos números a tu gusto:
  const scale = useMemo(() => {
    const s = diameter / 50;              // 50 m ~ 1 unidad
    return Math.max(0.2, Math.min(s, 10)); // clamp
  }, [diameter]);

  // Rotación proporcional a velocidad
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const speed = 0.2 + velocity * 0.02;   // ajusta sensibilidad
    meshRef.current.rotation.y += delta * speed;
    meshRef.current.rotation.x += delta * (speed * 0.4);
  });

  // Color que reacciona un poco a la velocidad
  const color = velocity > 25 ? "#ff7043" : velocity > 15 ? "#f59e0b" : "#9ca3af";

  return (
    <mesh ref={meshRef} scale={scale} castShadow receiveShadow>
      {/* Icosaedro con detalle para “rocoso” */}
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

export default function MeteorPreview({ diameter, velocity }: Props) {
  return (
    <div style={{ width: "100%", height: 360, background: "#0b1220", borderRadius: 12 }}>
      <Canvas shadows camera={{ position: [3, 2, 5], fov: 45 }}>
        <color attach="background" args={["#0b1220"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <MeteorMesh diameter={diameter} velocity={velocity} />
        <ContactShadows opacity={0.35} scale={15} blur={2} far={6} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
