import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function createSoftGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, 'rgba(245, 223, 169, 1)');
  grad.addColorStop(0.35, 'rgba(196, 154, 88, 0.75)');
  grad.addColorStop(1, 'rgba(196, 154, 88, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function ScentParticles({
  count = 85,
  pointerRef,
  animStateRef,
  isMobile = false,
}) {
  const pointsRef = useRef(null);
  const glowTex = useMemo(() => createSoftGlowTexture(), []);

  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Deterministic golden-angle distribution around the flacon
      const angle = i * 2.3999632;
      const radius = 1.15 + ((i * 73) % 100) / 36;
      const y = (((i * 41) % 100) / 100 - 0.5) * 4.4;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius * 0.75 - 0.35;

      sd[i * 3] = 0.25 + ((i * 19) % 100) / 180; // drift speed
      sd[i * 3 + 1] = (i * 0.67) % (Math.PI * 2); // phase
      sd[i * 3 + 2] = 0.08 + ((i * 29) % 100) / 450; // sway amplitude
    }
    return { positions: pos, seeds: sd };
  }, [count]);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  useEffect(() => {
    return () => {
      glowTex.dispose();
    };
  }, [glowTex]);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const scroll = animStateRef?.current?.scroll ?? 0;
    const ptr = pointerRef?.current ?? { x: 0, y: 0 };

    // Opposite-axis parallax on the particle field for depth
    const targetX = (isMobile ? 0 : 1.05) - ptr.x * 0.42;
    const targetY = -ptr.y * 0.28 + scroll * 0.35;
    pts.position.x = THREE.MathUtils.lerp(pts.position.x, targetX, dt * 3);
    pts.position.y = THREE.MathUtils.lerp(pts.position.y, targetY, dt * 3);
    pts.rotation.y = t * 0.045 + scroll * 0.55;

    // Gentle upward scent drift (accelerates slightly when cap opens in Act 2)
    const boost = 1 + Math.max(0, (scroll - 0.55) * 2.2);
    const attr = pts.geometry.attributes.position;
    const arr = attr.array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const speed = seeds[idx] * boost;
      const phase = seeds[idx + 1];
      const amp = seeds[idx + 2];

      arr[idx] = basePositions[idx] + Math.sin(t * 0.5 + phase) * amp;
      arr[idx + 1] += speed * dt * 0.42;
      if (arr[idx + 1] > 2.35) {
        arr[idx + 1] = -2.25;
      }
    }
    attr.needsUpdate = true;

    // Subtle shimmer in opacity
    if (pts.material) {
      pts.material.opacity = 0.52 + Math.min(0.28, scroll * 0.25);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={glowTex}
        size={isMobile ? 0.1 : 0.115}
        color="#f5dfa9"
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
