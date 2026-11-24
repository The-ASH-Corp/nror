import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Deterministic golden mist motes around the bottle (lightweight DOM, zero WebGL overhead)
const MOTES = [
  { left: '16%', top: '22%', size: 4, delay: 0, dur: 5.5 },
  { left: '82%', top: '18%', size: 3, delay: 1.1, dur: 6.2 },
  { left: '78%', top: '68%', size: 5, delay: 0.6, dur: 5.8 },
  { left: '20%', top: '74%', size: 3, delay: 1.8, dur: 6.6 },
  { left: '88%', top: '44%', size: 3.5, delay: 2.2, dur: 5.2 },
  { left: '12%', top: '48%', size: 4, delay: 0.9, dur: 6.8 },
  { left: '66%', top: '12%', size: 3, delay: 1.5, dur: 5.9 },
  { left: '34%', top: '84%', size: 3.5, delay: 2.5, dur: 6.1 },
];

export default function NrorBottleShowcase({
  bottleWrapRef,
  bottleScrollRef,
  auraRef,
  shadowRef,
  reducedMotion = false,
}) {
  const stageRef = useRef(null);
  const floatRef = useRef(null);
  const parallaxRef = useRef(null);
  const lightShiftRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Subtle weightless floating animation + synchronized floor shadow breathing
      gsap.to(floatRef.current, {
        y: -14,
        rotation: 1.2,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      if (shadowRef?.current) {
        gsap.to(shadowRef.current, {
          scaleX: 0.88,
          opacity: 0.42,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Gentle ambient breathing on floating scent motes
      gsap.utils.toArray('.nror-mote').forEach((el, i) => {
        const m = MOTES[i % MOTES.length];
        gsap.to(el, {
          y: -26,
          x: i % 2 === 0 ? 10 : -10,
          opacity: 0.75,
          duration: m.dur,
          delay: m.delay,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, stageRef);

    // 2. Smooth mouse-following 2.5D parallax & subtle vertical-axis rotation
    const qX = gsap.quickTo(parallaxRef.current, 'x', { duration: 0.9, ease: 'power3.out' });
    const qY = gsap.quickTo(parallaxRef.current, 'y', { duration: 0.9, ease: 'power3.out' });
    const qRotY = gsap.quickTo(parallaxRef.current, 'rotationY', { duration: 1.0, ease: 'power3.out' });
    const qRotX = gsap.quickTo(parallaxRef.current, 'rotationX', { duration: 1.0, ease: 'power3.out' });

    const qLightX = gsap.quickTo(lightShiftRef.current, 'x', { duration: 1.1, ease: 'power3.out' });
    const qLightY = gsap.quickTo(lightShiftRef.current, 'y', { duration: 1.1, ease: 'power3.out' });

    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1

      // Restrained non-distorting 2.5D tilt & parallax
      qX(nx * 16);
      qY(ny * 10);
      qRotY(nx * 11); // subtle vertical-axis 3D-like turn without distorting proportions
      qRotX(-ny * 5);

      // Opposite-depth studio glow shift for realistic lighting play
      qLightX(-nx * 28);
      qLightY(-ny * 20);
    };

    const handlePointerLeave = () => {
      qX(0);
      qY(0);
      qRotY(0);
      qRotX(0);
      qLightX(0);
      qLightY(0);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      ctx.revert();
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [reducedMotion, shadowRef]);

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-[540px] lg:max-w-[600px] mx-auto flex flex-col items-center justify-center select-none pointer-events-none"
      style={{ perspective: '1200px' }}
    >
      {/* Layered Studio Backlight & Warm Amber/Crimson Rim Aura behind the Bottle */}
      <div
        ref={lightShiftRef}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center -z-10"
      >
        <div
          ref={auraRef}
          className="relative w-[300px] h-[380px] sm:w-[380px] sm:h-[460px] lg:w-[440px] lg:h-[520px] flex items-center justify-center"
        >
          {/* Deep Crimson Halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#780F27]/55 via-[#C49A58]/22 to-transparent blur-3xl" />
          {/* Warm Champagne-Gold Key Glow behind lower-right glass edge */}
          <div className="absolute bottom-8 right-6 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#C49A58]/25 blur-3xl" />
          {/* Soft Rose Highlight behind upper cap */}
          <div className="absolute top-6 left-10 w-44 h-44 rounded-full bg-[#9e1435]/30 blur-3xl" />
        </div>
      </div>

      {/* Subtle Floating Golden Motes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {MOTES.map((m, idx) => (
          <span
            key={idx}
            className="nror-mote absolute rounded-full bg-[#f5dfa9] opacity-25"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              boxShadow: '0 0 10px rgba(196, 154, 88, 0.75)',
            }}
          />
        ))}
      </div>

      {/* Entrance wrapper -> ScrollTrigger wrapper -> Mouse Parallax wrapper -> Idle Float wrapper */}
      <div ref={bottleWrapRef} className="relative z-10 flex items-center justify-center">
        <div
          ref={bottleScrollRef}
          style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          <div
            ref={parallaxRef}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
          >
            <div ref={floatRef} style={{ willChange: 'transform' }}>
              <img
                src="/nror-bottle.png"
                alt="NROR Eau de Parfum 150 mL Luxury Bottle"
                draggable={false}
                className="block w-auto h-[272px] sm:h-[344px] md:h-[384px] lg:h-[432px] xl:h-[480px] max-w-full object-contain"
                style={{
                  filter:
                    'drop-shadow(0 28px 34px rgba(12, 1, 4, 0.78)) drop-shadow(0 0 26px rgba(196, 154, 88, 0.18))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Soft Grounded Studio Shadow beneath the floating bottle */}
      <div
        ref={shadowRef}
        aria-hidden="true"
        className="mt-1 sm:mt-2 w-44 sm:w-56 lg:w-64 h-7 rounded-full bg-black/65 blur-xl opacity-60 pointer-events-none"
      />
    </div>
  );
}
