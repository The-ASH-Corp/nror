import React, { useEffect, useRef } from 'react';

const TOTAL_FRAMES = 238;

const getFrameSrc = (index) => {
  const frameNum = String(index).padStart(3, '0');
  return `/images/heroSection/ezgif-frame-${frameNum}.png`;
};

export default function BottleSplashAnimation({ progress = 0 }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const rafIdRef = useRef(null);

  // High-DPI draw frame to canvas with aspect-ratio cover
  const renderFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const clampedIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameNum)));
    const img = imagesRef.current[clampedIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = cw;
      renderH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  // Setup canvas resolution with Retina/DPR scaling
  const syncCanvasResolution = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    renderFrame(currentFrameRef.current);
  };

  // Preload all frames on mount & render frame 001 immediately
  useEffect(() => {
    let isCancelled = false;
    const imgs = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);

      if (i === 1) {
        img.onload = () => {
          if (isCancelled) return;
          syncCanvasResolution();
          renderFrame(1);
        };
      }

      imgs.push(img);
    }

    imagesRef.current = imgs;
    syncCanvasResolution();

    const handleResize = () => {
      syncCanvasResolution();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const target = 1 + Math.round(clampedProgress * (TOTAL_FRAMES - 1));
    targetFrameRef.current = target;

    const updateFrame = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      if (Math.abs(target - current) > 0.4) {
        const step = (target - current) * 0.45;
        const next = Math.abs(target - current) <= 1 ? target : current + step;
        currentFrameRef.current = next;
        renderFrame(next);
        rafIdRef.current = requestAnimationFrame(updateFrame);
      } else {
        currentFrameRef.current = target;
        renderFrame(target);
      }
    };

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(updateFrame);
  }, [progress]);

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
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-radial from-secondaryColor/20 via-transparent to-transparent blur-3xl pointer-events-none -z-10"
      />
    </div>
  );
}
