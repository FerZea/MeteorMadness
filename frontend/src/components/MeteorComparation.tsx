import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture, Html, Billboard, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

import diffuseUrl from "/textures/meteor_diffuse.png?url";
import normalUrl from "/textures/meteor_normal.png?url";
import roughnessUrl from "/textures/meteor_roughness.png?url";

type Props = {
  diameter: number; // km
  velocity: number; // km/s
};

// --- Constantes ---
const DINO_IMPACTOR_DIAMETER_KM = 10;
const DINO_IMPACTOR_RADIUS_KM = DINO_IMPACTOR_DIAMETER_KM / 2;

const gapFromSizes = (r1: number, r2: number) => Math.max(0.1 * (r1 + r2), 0.25);
const labelYOffset = (r: number) => r * 0.25 + 0.15;

// Transición suave entre 5 km y 10 km
const smoothstep = (x: number, edge0: number, edge1: number) => {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

// --- Geometrías ---
function MeteorMesh({ diameter, velocity }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const radius = useMemo(() => Math.max(1e-6, diameter / 2), [diameter]);

  const [map, normalMap, roughnessMap] = useTexture([diffuseUrl, normalUrl, roughnessUrl]);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const spin = 0.25 + velocity * 0.02;
    meshRef.current.rotation.y += dt * spin;
    meshRef.current.rotation.x += dt * (spin * 0.35);
  });

  return (
    <mesh ref={meshRef} scale={radius} castShadow receiveShadow>
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

function DinoImpactorMesh({ velocity }: { velocity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const r = DINO_IMPACTOR_RADIUS_KM;

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const spin = 0.15 + velocity * 0.01;
    groupRef.current.rotation.y += dt * spin;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={r} castShadow receiveShadow>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#b7b7b7" roughness={0.95} metalness={0.02} />
      </mesh>
      <Billboard>
        <Html
          center
          position={[0, r + labelYOffset(r), 0]}
          style={{
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            textShadow: "0 0 6px rgba(0,0,0,0.7)",
            pointerEvents: "none",
          }}
        >
          Impactor de Chicxulub (≈10 km)
        </Html>
      </Billboard>
    </group>
  );
}

// --- Utilidad de encuadre ---
function distanceForFraming(camera: THREE.PerspectiveCamera, halfWidth: number, halfHeight: number) {
  const fovY = THREE.MathUtils.degToRad(camera.fov);
  const tanY = Math.tan(fovY / 2);
  const aspect = (camera as any).aspect || 16 / 9;
  const tanX = aspect * tanY;
  const distV = halfHeight / tanY;
  const distH = halfWidth / tanX;
  return Math.max(distV, distH);
}

// --- Cámara ---
function CameraRig({
  rMeteor,
  rImp,
  centerDist,
  blend,
  targetX,
}: {
  rMeteor: number;
  rImp: number;
  centerDist: number;
  blend: number;
  targetX: number;
}) {
  const { camera, size } = useThree();
  const desired = useRef(new THREE.Vector3());
  const started = useRef(false);

  const halfWidthM = rMeteor;
  const halfHeightM = rMeteor + labelYOffset(rMeteor);

  const halfWidthBoth = (centerDist + rImp + rMeteor) / 2;
  const halfHeightBoth = Math.max(rMeteor + labelYOffset(rMeteor), rImp + labelYOffset(rImp));

  const halfWidth = THREE.MathUtils.lerp(halfWidthM, halfWidthBoth, blend);
  const halfHeight = THREE.MathUtils.lerp(halfHeightM, halfHeightBoth, blend);

  const fitDistance = useMemo(() => {
    (camera as any).aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    return distanceForFraming(camera as THREE.PerspectiveCamera, halfWidth, halfHeight);
  }, [camera, size.width, size.height, halfWidth, halfHeight]);

  const SAFETY = 1.15;
  const targetZ = fitDistance * SAFETY;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    camera.position.set(0, 2.2, targetZ * 1.6);
    camera.lookAt(targetX, 0, 0);
  }, [camera, targetZ, targetX]);

  useFrame((_, dt) => {
    desired.current.set(0, 2.2, targetZ);
    camera.position.lerp(desired.current, THREE.MathUtils.clamp(dt * 3, 0, 1));

    camera.near = Math.max(0.01, targetZ * 0.02);
    camera.far = Math.max(2000, targetZ * 10);
    camera.updateProjectionMatrix();

    const look = new THREE.Vector3(targetX, 0, 0);
    const currentDir = new THREE.Vector3().subVectors(look, camera.position);
    camera.lookAt(camera.position.clone().add(currentDir));
  });

  return null;
}

function FollowControls({ targetX }: { targetX: number }) {
  const controlsRef = useRef<any>(null);
  useFrame((_, dt) => {
    if (!controlsRef.current) return;
    const t = controlsRef.current.target;
    t.lerp(new THREE.Vector3(targetX, 0, 0), THREE.MathUtils.clamp(dt * 3, 0, 1));
    controlsRef.current.update();
  });
  return <OrbitControls ref={controlsRef} enablePan={false} />;
}

// --- Escena ---
function ComparisonScene({ diameter, velocity }: Props) {
  const rMeteor = useMemo(() => Math.max(1e-6, diameter / 2), [diameter]);
  const rImp = DINO_IMPACTOR_RADIUS_KM;

  const margin = useMemo(() => gapFromSizes(rMeteor, rImp), [rMeteor, rImp]);
  const centerDist = useMemo(() => rMeteor + rImp + margin, [rMeteor, rImp, margin]);

  const blend = useMemo(() => smoothstep(diameter, 5, 10), [diameter]);
  const targetBothX = (centerDist + rImp - rMeteor) / 2;
  const targetX = THREE.MathUtils.lerp(0, targetBothX, blend);

  return (
    <group>
      {/* Tu meteorito principal */}
      <group position={[0, 0, 0]}>
        <MeteorMesh diameter={diameter} velocity={velocity} />
        <Billboard>
          <Html
            center
            position={[0, rMeteor + labelYOffset(rMeteor), 0]}
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              textShadow: "0 0 6px rgba(0,0,0,0.7)",
              pointerEvents: "none",
            }}
          >
            Meteorito personalizado ({diameter.toFixed(1)} km)
          </Html>
        </Billboard>
      </group>

      {/* Impactor de Chicxulub */}
      <group position={[centerDist, 0, 0]}>
        <DinoImpactorMesh velocity={velocity} />
      </group>

      <CameraRig rMeteor={rMeteor} rImp={rImp} centerDist={centerDist} blend={blend} targetX={targetX} />
      <FollowControls targetX={targetX} />
    </group>
  );
}

export default function MeteorComparation({ diameter, velocity }: Props) {
  return (
    <div style={{ width: "100%", height: 360, background: "#000", borderRadius: 12 }}>
      <Canvas shadows camera={{ position: [0, 2.2, 7], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={<Html center style={{ color: "#fff" }}>Cargando comparativa…</Html>}>
          <Stars radius={200} depth={80} count={8000} factor={2} saturation={0} fade speed={0.25} />
          <ambientLight intensity={0.75} />
          <directionalLight position={[6, 8, 4]} intensity={1.4} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-8, -2, -6]} intensity={0.35} color={"#6ea7ff"} />

          <ComparisonScene diameter={diameter} velocity={velocity} />
        </Suspense>
      </Canvas>
    </div>
  );
}
