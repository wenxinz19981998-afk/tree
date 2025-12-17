import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { ChristmasTree } from './Tree';

interface SceneProps {
  onLoad?: () => void;
  isFormed: boolean;
}

export const Scene: React.FC<SceneProps> = ({ onLoad, isFormed }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmicToneMapping
    >
      <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} />
      
      <color attach="background" args={['#010806']} />
      <fog attach="fog" args={['#010806', 5, 15]} />

      {/* Lighting - Dramatic & Cinematic */}
      <ambientLight intensity={0.5} color="#004433" />
      <spotLight
        position={[5, 10, 5]}
        angle={0.5}
        penumbra={1}
        intensity={200}
        castShadow
        shadow-mapSize={1024}
        color="#fff5cc"
      />
      <pointLight position={[-5, 2, -5]} intensity={20} color="#00ff88" distance={10} />

      {/* Reflections */}
      <Environment preset="city" />

      {/* The Star of the Show - Now Interactive */}
      <ChristmasTree position={[0, -1, 0]} isFormed={isFormed} />
      
      {/* Floor Shadows */}
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={isFormed} // Only rotate when formed, looks cooler if static when scattered or slow rotate
        autoRotateSpeed={0.5}
      />

      {/* Post Processing for the GLOW */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.1} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  );
};