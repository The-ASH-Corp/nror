import React, { Suspense, useRef, useEffect, Component } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import NrorBottleModel from './NrorBottleModel';
import StudioLighting from './StudioLighting';
import ScentParticles from './ScentParticles';

/**
 * Error boundary so non-WebGL environments degrade gracefully without crashing.
 */
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/nror-noir-rouge.jpg"
            alt="NROR Eau de Parfum"
            className="w-64 sm:w-80 rounded-xs opacity-90 object-contain"
          />
        </div>
      );
    }
    return this.props.children;
  }
}

function SceneRig({ animStateRef, pointerRef, reducedMotion }) {
  const bottleRef = useRef(null);
  const capRef = useRef(null);
  const haloRef = useRef(null);
  const rimLightRef = useRef(null);
  const smoothPointer = useRef({ x: 0, y: 0 });
  const { size, camera } = useThree();

  const isMobile = size.width < 1024;

  useFrame((state, delta) => {
    const bottle = bottleRef.current;
    if (!bottle) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const damp = 1 - Math.exp(-5.5 * dt);

    // Smooth pointer damping
    const rawPtr = pointerRef?.current ?? { x: 0, y: 0 };
    smoothPointer.current.x = THREE.MathUtils.lerp(
      smoothPointer.current.x,
      reducedMotion ? 0 : rawPtr.x,
      damp
    );
    smoothPointer.current.y = THREE.MathUtils.lerp(
      smoothPointer.current.y,
      reducedMotion ? 0 : rawPtr.y,
      damp
    );
    const px = smoothPointer.current.x;
    const py = smoothPointer.current.y;

    const entrance = animStateRef?.current?.entrance ?? 1;
    const scroll = animStateRef?.current?.scroll ?? 0;

    // Split scroll into Act 1 (0 -> 0.65: sculptural close-up turn) & Act 2 (0.65 -> 1.0: cap reveal & release)
    const act1 = THREE.MathUtils.clamp(scroll / 0.65, 0, 1);
    const act2 = THREE.MathUtils.clamp((scroll - 0.65) / 0.35, 0, 1);
    const easeAct1 = act1 * act1 * (3 - 2 * act1); // smoothstep
    const easeAct2 = act2 * act2 * (3 - 2 * act2);

    // Idle weightless floating & breathing
    const floatY = reducedMotion ? 0 : Math.sin(t * 1.15) * 0.075;
    const breatheZ = reducedMotion ? 0 : Math.sin(t * 0.72) * 0.032;

    // Responsive base framing: right-weighted on desktop, centered lower on mobile
    const baseX = isMobile ? 0 : 1.52;
    const baseY = isMobile ? -0.85 : -0.18;
    const baseScale = isMobile ? 0.68 : 0.92;

    // Bottle position: drops smoothly on entrance, centers slightly during close-up
    const targetX = baseX - (isMobile ? 0 : easeAct1 * 0.24) + easeAct2 * (isMobile ? 0 : 0.12);
    const targetY =
      baseY +
      (1 - entrance) * 0.65 +
      floatY +
      easeAct1 * 0.12 -
      easeAct2 * 0.08;

    bottle.position.x = THREE.MathUtils.lerp(bottle.position.x, targetX, damp);
    bottle.position.y = THREE.MathUtils.lerp(bottle.position.y, targetY, damp);

    const targetScale = baseScale * (0.9 + entrance * 0.1) * (1 + easeAct1 * 0.06 - easeAct2 * 0.03);
    bottle.scale.setScalar(THREE.MathUtils.lerp(bottle.scale.x, targetScale, damp));

    // Bottle rotation: iconic poised tilt echoing the reference image -> smooth sculptural orbit + mouse tilt
    const baseRotY = -0.24 + (1 - entrance) * -0.5;
    const scrollRotY = easeAct1 * Math.PI * 1.25 + easeAct2 * Math.PI * 0.75;
    const targetRotY = baseRotY + scrollRotY + px * 0.34;

    const targetRotX =
      0.06 +
      Math.sin(easeAct1 * Math.PI) * 0.12 -
      easeAct2 * 0.05 -
      py * 0.16;

    const targetRotZ = -0.14 + breatheZ - px * 0.07 + easeAct1 * 0.1;

    bottle.rotation.y = THREE.MathUtils.lerp(bottle.rotation.y, targetRotY, damp);
    bottle.rotation.x = THREE.MathUtils.lerp(bottle.rotation.x, targetRotX, damp);
    bottle.rotation.z = THREE.MathUtils.lerp(bottle.rotation.z, targetRotZ, damp);

    // Cap levitation in Act 2 (revealing satin-gold atomizer)
    if (capRef.current) {
      const capLift = 1.62 + easeAct2 * 0.42;
      capRef.current.position.y = THREE.MathUtils.lerp(capRef.current.position.y, capLift, damp);
      capRef.current.rotation.y = THREE.MathUtils.lerp(
        capRef.current.rotation.y,
        easeAct2 * 0.6,
        damp
      );
    }

    // Subtle golden aura ring pulse at base
    if (haloRef.current) {
      const ringScale = 1 + easeAct1 * 0.14 + easeAct2 * 0.22 + Math.sin(t * 1.4) * 0.025;
      haloRef.current.scale.setScalar(ringScale);
      if (haloRef.current.material) {
        haloRef.current.material.opacity = 0.22 + easeAct2 * 0.26;
      }
    }

    // Interactive studio rim-light shift across glass bevels
    if (rimLightRef.current) {
      rimLightRef.current.position.x = THREE.MathUtils.lerp(
        rimLightRef.current.position.x,
        -4.2 + px * 2.4,
        damp
      );
      rimLightRef.current.position.y = THREE.MathUtils.lerp(
        rimLightRef.current.position.y,
        1.6 + py * 1.6,
        damp
      );
      rimLightRef.current.intensity = 4.2 + easeAct2 * 2.2;
    }

    // Responsive camera choreography with subtle mouse parallax
    const baseCamZ = isMobile ? 7.1 : 6.1;
    const targetCamZ = baseCamZ - Math.sin(easeAct1 * Math.PI * 0.85) * 0.88 + easeAct2 * 0.35;
    const targetCamX = px * 0.28;
    const targetCamY = (isMobile ? -0.15 : 0.18) + py * 0.18 - easeAct1 * 0.16 + easeAct2 * 0.12;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, damp * 0.8);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, damp * 0.8);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, damp * 0.8);
    camera.lookAt(isMobile ? 0 : 0.55, isMobile ? -0.55 : -0.05, 0);
  });

  return (
    <>
      <StudioLighting rimLightRef={rimLightRef} />
      <NrorBottleModel ref={bottleRef} capRef={capRef} haloRef={haloRef} />
      <ScentParticles
        count={isMobile ? 42 : 85}
        pointerRef={pointerRef}
        animStateRef={animStateRef}
        isMobile={isMobile}
      />
    </>
  );
}

export default function HeroScene({ animStateRef, reducedMotion = false }) {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    const handlePointerLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [reducedMotion]);

  return (
    <WebGLErrorBoundary>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 0.18, 6.1], fov: 36, near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        className="w-full h-full block"
      >
        <Suspense fallback={null}>
          <SceneRig
            animStateRef={animStateRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
