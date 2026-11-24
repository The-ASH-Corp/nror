import React from 'react';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';

export default function StudioLighting({ rimLightRef }) {
  return (
    <>
      {/* Subtle warm ambient base */}
      <ambientLight intensity={0.35} color="#fce7cc" />

      {/* Warm champagne-gold key light from front-right */}
      <spotLight
        position={[4.5, 5.5, 5]}
        angle={0.42}
        penumbra={0.85}
        intensity={2.4}
        color="#f5dfa9"
        castShadow
        shadow-mapSize={[512, 512]}
      />

      {/* Deep crimson rim light from left-back to sculpt glass silhouette */}
      <pointLight
        ref={rimLightRef}
        position={[-4.2, 1.6, -2.5]}
        intensity={4.5}
        distance={14}
        color="#a81538"
      />

      {/* Crisp silver-gold edge kicker from top-back */}
      <directionalLight
        position={[0.8, 4.5, -4.5]}
        intensity={1.35}
        color="#E6E2DF"
      />

      {/* Warm under-glow to illuminate the perfume elixir from beneath */}
      <pointLight
        position={[0, -2.6, 1.4]}
        intensity={1.6}
        distance={8}
        color="#C49A58"
      />

      {/* Procedural Studio Softbox Environment (Zero network HDRI downloads) */}
      <Environment resolution={256} frames={1}>
        {/* Right Champagne Key Softbox Strip */}
        <Lightformer
          form="rect"
          intensity={3.4}
          color="#f7e3b5"
          position={[4.5, 1.5, 3.5]}
          rotation={[0, -Math.PI / 3, 0]}
          scale={[2.2, 7.5, 1]}
        />
        {/* Left Crimson Rim Strip */}
        <Lightformer
          form="rect"
          intensity={3.0}
          color="#9e1435"
          position={[-5, 0.5, 1.2]}
          rotation={[0, Math.PI / 2.2, 0]}
          scale={[2.5, 8, 1]}
        />
        {/* Overhead Soft Specular Strip */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#fff4e0"
          position={[0, 6, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[7, 2.2, 1]}
        />
        {/* Back Silver Edge Strip */}
        <Lightformer
          form="rect"
          intensity={2.4}
          color="#E6E2DF"
          position={[2.5, 2, -5]}
          rotation={[0, Math.PI, 0]}
          scale={[1.5, 6, 1]}
        />
        {/* Warm Gold Floor Bounce & Lower-Right Amber Glass Edge Kicker */}
        <Lightformer
          form="rect"
          intensity={3.0}
          color="#e8b878"
          position={[4.2, -1.8, -1.8]}
          rotation={[0, -Math.PI / 2.2, 0]}
          scale={[3.2, 5.5, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.6}
          color="#C49A58"
          position={[0, -4.5, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={6.5}
        />
      </Environment>

      {/* Soft Grounded Contact Shadow beneath the floating bottle */}
      <ContactShadows
        position={[0, -1.98, 0]}
        opacity={0.58}
        scale={8}
        blur={2.5}
        far={4.4}
        color="#120205"
      />
    </>
  );
}
