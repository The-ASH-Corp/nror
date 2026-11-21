import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 238;
const SMOOTHING = 5;

const getFrameSrc = (index) => {
  const frameNum = String(index).padStart(3, '0');
  return `/images/heroSection/ezgif-frame-${frameNum}.png`;
};

export default function BottleSplashAnimation({ progressRef }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const imagesRef = useRef([]);
  const readyRef = useRef([]); // decoded flags per frame
  const currentRef = useRef(0); // fractional frame position (0-based)
  const lastDrawnRef = useRef(-1);
  const layoutRef = useRef(null);

  // Compute "cover" draw rect once per resize instead of every frame
  const computeLayout = (img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let w, h;
    if (cw / ch > imgRatio) {
      w = cw;
      h = cw / imgRatio;
    } else {
      h = ch;
      w = ch * imgRatio;
    }
    layoutRef.current = { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
  };

  // Find nearest decoded frame so we never draw a blank/undecoded image
  const nearestReady = (idx) => {
    const ready = readyRef.current;
    if (ready[idx]) return idx;
    for (let o = 1; o < TOTAL_FRAMES; o++) {
      if (idx - o >= 0 && ready[idx - o]) return idx - o;
      if (idx + o < TOTAL_FRAMES && ready[idx + o]) return idx + o;
    }
    return -1;
  };

  // Draw with cross-fade between adjacent frames for sub-frame smoothness
  const draw = (pos) => {
    const ctx = ctxRef.current;
    const layout = layoutRef.current;
    if (!ctx || !layout) return;

    const base = Math.floor(pos);
    const frac = pos - base;
    const a = nearestReady(base);
    if (a < 0) return;
    const { x, y, w, h } = layout;

    ctx.globalAlpha = 1;
    ctx.drawImage(imagesRef.current[a], x, y, w, h);

    const nextIdx = Math.min(TOTAL_FRAMES - 1, base + 1);
    if (frac > 0.02 && nextIdx !== a && readyRef.current[nextIdx]) {
      ctx.globalAlpha = frac;
      ctx.drawImage(imagesRef.current[nextIdx], x, y, w, h);
      ctx.globalAlpha = 1;
    }
  };

  const syncCanvasResolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctxRef.current = canvas.getContext('2d', { alpha: true });
    ctxRef.current.imageSmoothingEnabled = true;
    ctxRef.current.imageSmoothingQuality = 'high';
    const first = imagesRef.current.find((img, i) => readyRef.current[i]);
    computeLayout(first);
    lastDrawnRef.current = -1;
    draw(currentRef.current);
  };

  useEffect(() => {
    let cancelled = false;
    const imgs = new Array(TOTAL_FRAMES);
    readyRef.current = new Array(TOTAL_FRAMES).fill(false);
    imagesRef.current = imgs;

    const markReady = (i) => {
      if (cancelled) return;
      readyRef.current[i] = true;
      if (i === 0) syncCanvasResolution();
    };

    // Preload + pre-decode every frame (decode() avoids jank on first draw)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameSrc(i + 1);
      imgs[i] = img;
      const p = img.decode ? img.decode() : new Promise((res) => (img.onload = res));
      p.then(() => markReady(i)).catch(() => {
        img.onload = () => markReady(i);
      });
    }

    // Persistent render loop: eases the displayed frame toward the scroll target
    let rafId;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const p = Math.max(0, Math.min(1, progressRef?.current ?? 0));
      const target = p * (TOTAL_FRAMES - 1);
      const cur = currentRef.current;
      const diff = target - cur;

      if (Math.abs(diff) > 0.001) {
        const k = 1 - Math.exp(-SMOOTHING * dt);
        currentRef.current = Math.abs(diff) < 0.01 ? target : cur + diff * k;
      }

      // Only repaint when the visible position actually changes
      const q = Math.round(currentRef.current * 100);
      if (q !== lastDrawnRef.current) {
        lastDrawnRef.current = q;
        draw(currentRef.current);
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener('resize', syncCanvasResolution);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncCanvasResolution);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full max-w-[740px] aspect-[16/9] mx-auto flex items-center justify-center select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          WebkitMaskImage:
            'radial-gradient(ellipse 58% 54% at 54% 50%, black 15%, rgba(0,0,0,0.8) 38%, rgba(0,0,0,0.3) 60%, transparent 85%)',
          maskImage:
            'radial-gradient(ellipse 58% 54% at 54% 50%, black 15%, rgba(0,0,0,0.8) 38%, rgba(0,0,0,0.3) 60%, transparent 85%)',
          willChange: 'contents',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial from-secondaryColor/20 via-transparent to-transparent blur-3xl pointer-events-none -z-10"
      />
    </div>
  );
}
