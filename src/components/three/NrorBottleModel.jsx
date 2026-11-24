import React, { useMemo, useEffect, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * Helper to draw cleanly tracked text on a 2D canvas consistently across browsers.
 */
function drawTrackedText(ctx, text, centerX, y, tracking) {
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth =
    widths.reduce((sum, w) => sum + w, 0) + tracking * Math.max(0, chars.length - 1);
  let x = centerX - totalWidth / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x + widths[i] / 2, y);
    x += widths[i] + tracking;
  }
}

/**
 * Generates the exact borderless gold-foil front branding matching public/perfume-bottle.png:
 *   N
 *   NROR
 *   EAU DE PARFUM
 *   ———
 *   150 mL ℮ 6.45 FL.OZ.
 */
function createNrorLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const grad = ctx.createLinearGradient(180, 220, 840, 1100);
  grad.addColorStop(0, '#f7e3b2');
  grad.addColorStop(0.35, '#dfc07c');
  grad.addColorStop(0.7, '#C49A58');
  grad.addColorStop(1, '#e8ca8a');

  ctx.fillStyle = grad;
  ctx.strokeStyle = grad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = canvas.width / 2;

  // 1. Upper center monogram 'N'
  ctx.font = '400 200px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('N', cx, 350);

  // 2. Brand name 'NROR' directly below
  ctx.font = '400 156px "Cormorant Garamond", Georgia, serif';
  drawTrackedText(ctx, 'NROR', cx, 535, 18);

  // 3. 'EAU DE PARFUM' below NROR
  ctx.font = '400 38px "Montserrat", sans-serif';
  ctx.globalAlpha = 0.94;
  drawTrackedText(ctx, 'EAU DE PARFUM', cx, 668, 7);

  // 4. Short delicate horizontal gold hairline below EAU DE PARFUM
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 72, 738);
  ctx.lineTo(cx + 72, 738);
  ctx.stroke();

  // 5. Bottom volume '150 mL  ℮  6.45 FL.OZ.'
  ctx.globalAlpha = 0.88;
  ctx.font = '300 34px "Montserrat", sans-serif';
  drawTrackedText(ctx, '150 mL  ℮  6.45 FL.OZ.', cx, 1065, 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a high-resolution diamond-pattern quilted bump & roughness texture
 * matching the distinctive burgundy cap in public/perfume-bottle.png.
 */
function createDiamondCapTextures() {
  const width = 1024;
  const height = 512;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bctx = bumpCanvas.getContext('2d');

  // Deep grooves background
  bctx.fillStyle = '#181818';
  bctx.fillRect(0, 0, width, height);

  const cell = 24;
  const half = cell / 2;

  // Draw raised diamond studs in a crisp diagonal lattice
  for (let row = -1; row <= Math.ceil(height / half) + 1; row++) {
    const cy = row * half;
    const offsetX = row % 2 === 0 ? 0 : half;
    for (let col = -1; col <= Math.ceil(width / cell) + 1; col++) {
      const cx = col * cell + offsetX;

      // Outer beveled diamond stud
      bctx.beginPath();
      bctx.moveTo(cx, cy - half + 2.2);
      bctx.lineTo(cx + half - 2.2, cy);
      bctx.lineTo(cx, cy + half - 2.2);
      bctx.lineTo(cx - half + 2.2, cy);
      bctx.closePath();

      const grad = bctx.createRadialGradient(cx, cy, 1, cx, cy, half - 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, '#d8d8d8');
      grad.addColorStop(1, '#5a5a5a');
      bctx.fillStyle = grad;
      bctx.fill();
    }
  }

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(2.2, 1.15);
  bumpTexture.anisotropy = 8;
  bumpTexture.needsUpdate = true;

  return bumpTexture;
}

/**
 * Builds a chamfered/beveled rectangular perfume bottle geometry with crisp optical edges.
 */
function createBeveledBottleGeometry(w, h, r, depth, bevelThickness, bevelSize) {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;

  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize,
    bevelThickness,
    curveSegments: 16,
  });
  geom.center();
  geom.computeVertexNormals();
  return geom;
}

const NrorBottleModel = forwardRef(function NrorBottleModel(
  { capRef, haloRef, ...props },
  ref
) {
  const labelTexture = useMemo(() => createNrorLabelTexture(), []);
  const capBumpTexture = useMemo(() => createDiamondCapTextures(), []);

  // Outer heavy crystal glass flacon: total ~1.88w x 2.44h x 0.98d (exact 1:1.30 ratio)
  const outerGlassGeo = useMemo(
    () => createBeveledBottleGeometry(1.64, 2.2, 0.08, 0.7, 0.14, 0.12),
    []
  );

  // Inner deep burgundy wine-red perfume chamber (leaves thick transparent glass walls & heavy base)
  const innerLiquidGeo = useMemo(
    () => createBeveledBottleGeometry(1.36, 1.74, 0.05, 0.54, 0.06, 0.06),
    []
  );

  // Heavy transparent crystal glass base prism for rich bottom reflections
  const glassBaseGeo = useMemo(
    () => createBeveledBottleGeometry(1.52, 0.24, 0.05, 0.64, 0.05, 0.05),
    []
  );

  useEffect(() => {
    return () => {
      labelTexture.dispose();
      capBumpTexture.dispose();
      outerGlassGeo.dispose();
      innerLiquidGeo.dispose();
      glassBaseGeo.dispose();
    };
  }, [labelTexture, capBumpTexture, outerGlassGeo, innerLiquidGeo, glassBaseGeo]);

  return (
    <group ref={ref} {...props}>
      {/* ================= OUTER ARCHITECTURAL CRYSTAL GLASS FLACON ================= */}
      <mesh
        geometry={outerGlassGeo}
        position={[0, -0.22, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#fff4f2"
          transmission={0.93}
          opacity={1}
          transparent
          thickness={1.65}
          ior={1.54}
          roughness={0.045}
          metalness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.04}
          attenuationColor="#8c142d"
          attenuationDistance={2.2}
          reflectivity={0.98}
          envMapIntensity={1.9}
        />
      </mesh>

      {/* Heavy Transparent Crystal Glass Base Pedestal */}
      <mesh geometry={glassBaseGeo} position={[0, -1.24, 0]}>
        <meshPhysicalMaterial
          color="#ffeae2"
          transmission={0.9}
          thickness={2.0}
          ior={1.58}
          roughness={0.04}
          clearcoat={1}
          attenuationColor="#C49A58"
          attenuationDistance={1.9}
          envMapIntensity={2.1}
        />
      </mesh>

      {/* ================= DEEP BURGUNDY / WINE-RED PERFUME INSIDE ================= */}
      <mesh geometry={innerLiquidGeo} position={[0, -0.14, 0]}>
        <meshPhysicalMaterial
          color="#4d0513"
          emissive="#2a030a"
          emissiveIntensity={0.42}
          roughness={0.13}
          metalness={0.06}
          transmission={0.28}
          thickness={0.85}
          ior={1.36}
          attenuationColor="#7a0c23"
          attenuationDistance={0.9}
          envMapIntensity={1.35}
        />
      </mesh>

      {/* ================= EXACT HOT-STAMPED GOLD-FOIL FRONT BRANDING ================= */}
      <mesh position={[0, -0.16, 0.495]}>
        <planeGeometry args={[1.48, 1.85]} />
        <meshStandardMaterial
          map={labelTexture}
          transparent
          metalness={0.92}
          roughness={0.2}
          envMapIntensity={2.05}
          depthWrite={false}
        />
      </mesh>

      {/* ================= POLISHED METALLIC GOLD NECK ================= */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.41, 0.28, 64]} />
        <meshStandardMaterial
          color="#dfb86f"
          metalness={0.98}
          roughness={0.11}
          envMapIntensity={2.25}
        />
      </mesh>

      {/* Inner Gold Atomizer Sprayer (revealed smoothly when cap lifts on scroll) */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.28, 40]} />
        <meshStandardMaterial
          color="#d9b269"
          metalness={0.96}
          roughness={0.16}
          envMapIntensity={2.0}
        />
      </mesh>
      <mesh position={[0, 1.42, 0.208]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.02, 20]} />
        <meshStandardMaterial color="#1f0409" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* ================= SIGNATURE OVERSIZED DIAMOND-TEXTURED BURGUNDY CAP ================= */}
      <group ref={capRef} position={[0, 1.62, 0]}>
        {/* Bottom Polished Metallic Gold Ring (prominent overhanging rim) */}
        <mesh position={[0, -0.355, 0]} castShadow>
          <cylinderGeometry args={[0.675, 0.655, 0.085, 64]} />
          <meshStandardMaterial
            color="#e5c17b"
            metalness={0.98}
            roughness={0.1}
            envMapIntensity={2.35}
          />
        </mesh>

        {/* Diamond-Pattern Textured Cylindrical Burgundy Body */}
        <mesh position={[0, 0.0, 0]} castShadow>
          <cylinderGeometry args={[0.66, 0.66, 0.64, 96]} />
          <meshStandardMaterial
            color="#5c0a1e"
            metalness={0.58}
            roughness={0.28}
            bumpMap={capBumpTexture}
            bumpScale={0.042}
            envMapIntensity={1.85}
          />
        </mesh>

        {/* Top Polished Metallic Gold Ring */}
        <mesh position={[0, 0.355, 0]} castShadow>
          <cylinderGeometry args={[0.635, 0.668, 0.075, 64]} />
          <meshStandardMaterial
            color="#e5c17b"
            metalness={0.98}
            roughness={0.1}
            envMapIntensity={2.35}
          />
        </mesh>

        {/* Recessed Burgundy Metallic Top Crown */}
        <mesh position={[0, 0.394, 0]}>
          <cylinderGeometry args={[0.61, 0.61, 0.015, 64]} />
          <meshStandardMaterial
            color="#3d0713"
            metalness={0.62}
            roughness={0.22}
            envMapIntensity={1.65}
          />
        </mesh>
      </group>

      {/* ================= SUBTLE GOLDEN AURA RING AT BASE ================= */}
      <mesh
        ref={haloRef}
        position={[0, -1.56, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.18, 1.215, 72]} />
        <meshBasicMaterial
          color="#C49A58"
          transparent
          opacity={0.24}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});

export default NrorBottleModel;
