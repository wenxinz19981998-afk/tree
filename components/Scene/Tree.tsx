import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { GoldMaterial, EmeraldMaterial, GiftWrapMaterial, FoliageMaterial } from './Materials';

// --- MATH HELPERS ---

const randomVectorInSphere = (radius: number) => {
  const phi = Math.random() * Math.PI * 2;
  const costheta = Math.random() * 2 - 1;
  const u = Math.random();
  const theta = Math.acos(costheta);
  const r = radius * Math.cbrt(u);
  return new THREE.Vector3(
    r * Math.sin(theta) * Math.cos(phi),
    r * Math.sin(theta) * Math.sin(phi),
    r * Math.cos(theta)
  );
};

// --- FOLIAGE COMPONENT (THREE.Points) ---

const FoliageLayer = ({ isFormed }: { isFormed: boolean }) => {
  const materialRef = useRef<FoliageMaterial>(null);
  const count = 4000; // Dense cloud of needles

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const treePositions = [];
    const scatterPositions = [];
    const randoms = [];

    for (let i = 0; i < count; i++) {
      // 1. Scatter Position (Galaxy/Sphere)
      const sPos = randomVectorInSphere(7);
      sPos.y += 1;
      scatterPositions.push(sPos.x, sPos.y, sPos.z);

      // 2. Tree Position (Cone Volume)
      // Cone shape: Base radius ~2.5, Height ~6, Top ~3.5
      const height = 6.0;
      const yNorm = Math.random(); // 0 to 1
      const y = (yNorm * height) - 2.5; // -2.5 to 3.5
      
      // Radius decreases as y increases
      const maxRadius = 2.2 * (1.0 - yNorm);
      // Volume distribution (sqroot of random)
      const r = Math.sqrt(Math.random()) * maxRadius;
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      treePositions.push(x, y, z);
      
      randoms.push(Math.random());
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(treePositions, 3)); // Default to tree?
    geo.setAttribute('aTreePos', new THREE.Float32BufferAttribute(treePositions, 3));
    geo.setAttribute('aScatterPos', new THREE.Float32BufferAttribute(scatterPositions, 3));
    geo.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));
    return geo;
  }, []);

  // Animation State
  const progress = useRef(isFormed ? 1 : 0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Smooth morph transition
      const target = isFormed ? 1 : 0;
      progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.5);
      
      materialRef.current.uniforms.uMorphFactor.value = progress.current;
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points geometry={geometry}>
      <primitive object={new FoliageMaterial()} ref={materialRef} attach="material" />
    </points>
  );
};

// --- ORNAMENT SYSTEM (InstancedMesh) ---

interface InstanceData {
  treePos: THREE.Vector3;
  scatterPos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
}

const MorphingOrnaments = ({ 
  count, 
  generateTreePos, 
  geometry, 
  materialComponent: Material,
  isFormed,
  scaleMultiplier = 1,
  driftWeight = 1.0 // 1.0 = light (drifts far), 0.1 = heavy (stays close)
}: {
  count: number;
  generateTreePos: (i: number) => { pos: THREE.Vector3, scale: number };
  geometry: THREE.BufferGeometry;
  materialComponent: React.FC<any>;
  isFormed: boolean;
  scaleMultiplier?: number;
  driftWeight?: number;
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const data = useMemo(() => {
    const instances: InstanceData[] = [];
    for (let i = 0; i < count; i++) {
      const { pos: treePos, scale } = generateTreePos(i);
      const scatterPos = randomVectorInSphere(5 + driftWeight * 2); 
      scatterPos.y += 1; 
      
      instances.push({
        treePos,
        scatterPos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: scale * scaleMultiplier
      });
    }
    return instances;
  }, [count, generateTreePos, scaleMultiplier, driftWeight]);

  const progress = useRef(isFormed ? 1 : 0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = isFormed ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 2.0);
    const t = progress.current;
    // Elastic ease out
    const easedT = 1 - Math.pow(1 - t, 3); // Cubic ease out

    data.forEach((item, i) => {
      // Pos
      dummy.position.lerpVectors(item.scatterPos, item.treePos, easedT);
      
      // Add drift noise when scattered
      if (t < 0.99) {
          const time = state.clock.getElapsedTime();
          const driftAmp = (1.0 - t) * 0.2 * driftWeight;
          dummy.position.y += Math.sin(time * 0.5 + i) * driftAmp;
          dummy.position.x += Math.cos(time * 0.3 + i) * driftAmp;
      }

      // Rot
      dummy.rotation.copy(item.rotation);
      const spinSpeed = (1.0 - t) * 2.0 + 0.2; // Spin faster when scattered
      dummy.rotation.x += state.clock.getElapsedTime() * 0.5 * spinSpeed;
      dummy.rotation.y += state.clock.getElapsedTime() * 0.3 * spinSpeed;

      // Scale
      const s = item.scale * (0.2 + 0.8 * easedT); // Grow as they assemble
      dummy.scale.setScalar(s);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
      <Material />
    </instancedMesh>
  );
};

// --- MAIN TREE COMPONENT ---

export const ChristmasTree = ({ isFormed, ...props }: { isFormed: boolean } & any) => {
  const groupRef = useRef<THREE.Group>(null);

  // 1. Heavy Ornaments (Gifts) - Cubes
  const giftGeo = useMemo(() => new THREE.BoxGeometry(0.25, 0.25, 0.25), []);
  const generateGifts = (i: number) => {
    // Spiral but lower down mostly
    const t = i / 15;
    const angle = t * Math.PI * 8;
    const y = -2.0 + (t * 2.5); // Bottom half
    const r = 2.0 * (1 - (y + 2.5)/6); // Approximate radius surface
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    return { pos: new THREE.Vector3(x, y, z), scale: 1.0 + Math.random() * 0.5 };
  };

  // 2. Light Ornaments (Baubles) - Spheres
  const baubleGeo = useMemo(() => new THREE.SphereGeometry(0.12, 16, 16), []);
  const generateBaubles = (i: number) => {
    const total = 50;
    const t = i / total;
    const angle = t * Math.PI * 13 + 1; // Offset spiral
    const y = -2.2 + (t * 5.0);
    const r = (2.1 * (1 - (y + 2.5)/6.5));
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    return { pos: new THREE.Vector3(x, y, z), scale: 0.8 + Math.random() * 0.4 };
  };

  useFrame((state) => {
    if (groupRef.current && isFormed) {
        groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2} enabled={isFormed}>
        
        {/* Layer 1: The Foliage (Points Cloud) */}
        <FoliageLayer isFormed={isFormed} />

        {/* Layer 2: Heavy Ornaments (Gifts) */}
        <MorphingOrnaments 
          count={15}
          generateTreePos={generateGifts}
          geometry={giftGeo}
          materialComponent={GiftWrapMaterial}
          isFormed={isFormed}
          driftWeight={0.5} // Heavy, drifts less
        />

        {/* Layer 3: Light Ornaments (Baubles) */}
        <MorphingOrnaments 
          count={50}
          generateTreePos={generateBaubles}
          geometry={baubleGeo}
          materialComponent={GoldMaterial}
          isFormed={isFormed}
          driftWeight={2.0} // Light, drifts far
        />
        
        {/* Topper */}
        <mesh position={[0, 3.2, 0]} scale={isFormed ? 1 : 0}>
           <octahedronGeometry args={[0.35, 0]} />
           <GoldMaterial emissive="#FFD700" emissiveIntensity={2} toneMapped={false} />
        </mesh>
        
        {/* Central warm light */}
        <pointLight position={[0, 0, 0]} intensity={isFormed ? 3 : 0} color="#FFAA00" distance={6} decay={2} />
        
        {/* Sparkles */}
        <Sparkles 
           count={80}
           scale={6}
           size={6}
           speed={0.2}
           opacity={isFormed ? 0.6 : 0.2}
           color="#FFD700"
        />

      </Float>
    </group>
  );
};
