import { useEffect, useRef, useCallback } from 'react';

const TOTAL_FRAMES = 64;

/**
 * LERP FACTOR: 0.22 for silky smooth, zero-lag cursor tracking.
 */
const LERP_FACTOR = 0.22;

/**
 * DEADZONE: 12% radius around character face.
 * When cursor is within this radius, display center.webp (direct eye contact).
 */
const DEADZONE_FRACTION = 0.12;

/**
 * Shortest-path circular angular lerp.
 * Returns angle in (-PI, PI] moving `current` towards `target` via shortest arc.
 */
function lerpAngle(current, target, t) {
  let diff = target - current;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return current + diff * t;
}

/** Wrap angle to [-PI, PI] */
function wrapPI(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export default function CharacterCanvas() {
  const canvasRef = useRef(null);

  const state = useRef({
    frames: [],
    centerImg: null,
    smoothAngle: 0,
    mouseX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    mouseY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    smoothMouseX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    smoothMouseY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    rafId: null,
    canvasW: 0,
    canvasH: 0,
    dpr: 1,
  });

  /* ── 1. Preload 64 directional WebP frames + center.webp ── */
  useEffect(() => {
    const s = state.current;

    const ci = new Image();
    ci.src = `${import.meta.env.BASE_URL}center.webp`;
    s.centerImg = ci;

    s.frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}frames/frame_${String(i).padStart(2, '0')}.webp`;
      return img;
    });
  }, []);

  /* ── 2. Pointer/Mouse Tracking across Window ── */
  useEffect(() => {
    const onMove = (e) => {
      state.current.mouseX = e.clientX;
      state.current.mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  /* ── 3. Silky Smooth 60 FPS RAF Render Loop ── */
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const s = state.current;
    const ctx = canvas.getContext('2d');
    const dpr = s.dpr || window.devicePixelRatio || 1;
    const canvasW = s.canvasW || canvas.offsetWidth;
    const canvasH = s.canvasH || canvas.offsetHeight;

    if (!canvasW || !canvasH) {
      s.rafId = requestAnimationFrame(loop);
      return;
    }

    // Smoothly interpolate mouse coordinates for fluid movement
    s.smoothMouseX += (s.mouseX - s.smoothMouseX) * LERP_FACTOR;
    s.smoothMouseY += (s.mouseY - s.smoothMouseY) * LERP_FACTOR;

    // Canvas & Face center coordinates
    const rect = canvas.getBoundingClientRect();
    const faceCx = rect.left + rect.width * 0.50;
    const faceCy = rect.top + rect.height * 0.38;

    // Viewport-normalized directional vector for intuitive 360° tracking
    const normDx = (s.smoothMouseX - faceCx) / window.innerWidth;
    const normDy = (s.smoothMouseY - faceCy) / window.innerHeight;

    const rawDx = s.smoothMouseX - faceCx;
    const rawDy = s.smoothMouseY - faceCy;
    const dist = Math.hypot(rawDx, rawDy);

    const screenMin = Math.min(window.innerWidth, window.innerHeight);
    const deadzoneR = screenMin * DEADZONE_FRACTION;

    let imgToDraw;

    if (dist < deadzoneR) {
      // Direct eye contact when cursor is near character's face
      imgToDraw = s.centerImg;
      s.smoothAngle = wrapPI(lerpAngle(s.smoothAngle, 0, 0.08));
    } else {
      // 360-degree compass cursor tracking
      // atan2(normDy, normDx): 0=RIGHT, PI/2=DOWN, ±PI=LEFT, -PI/2=UP
      const targetAngle = Math.atan2(normDy, normDx);
      s.smoothAngle = wrapPI(lerpAngle(s.smoothAngle, targetAngle, LERP_FACTOR));

      let normAngle = s.smoothAngle;
      if (normAngle < 0) normAngle += 2 * Math.PI;

      // Map [0, 2PI) continuously to frame index [0..63]
      const angle = Math.atan2(rawDy, rawDx);

let degrees = angle * (180 / Math.PI);
if (degrees < 0) degrees += 360;

// Map cursor direction to the closest useful animation frame
// Smooth direction selection.
// Each cursor direction uses a known-good frame from the animation.

const directions = [
  { angle: 0, frame: 16 },     // RIGHT
  { angle: 45, frame: 24 },    // DOWN-RIGHT
  { angle: 90, frame: 28 },    // DOWN
  { angle: 135, frame: 32 },   // DOWN-LEFT
  { angle: 180, frame: 48 },   // LEFT
  { angle: 225, frame: 8 },    // UP-LEFT
  { angle: 270, frame: 4 },    // UP
  { angle: 315, frame: 16 },   // UP-RIGHT
];

// Find the closest direction.
let closestFrame = 16;
let smallestDifference = Infinity;

for (const direction of directions) {
  let difference = Math.abs(degrees - direction.angle);

  // Handle the 360° / 0° boundary.
  difference = Math.min(difference, 360 - difference);

  if (difference < smallestDifference) {
    smallestDifference = difference;
    closestFrame = direction.frame;
  }
}

imgToDraw = s.frames[closestFrame];
    }

    // Draw single crisp frame at 100% opacity (no alpha blending = zero ghosting)
    if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.drawImage(imgToDraw, 0, 0, canvasW, canvasH);
    }

    s.rafId = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    const s = state.current;
    s.rafId = requestAnimationFrame(loop);
    return () => {
      if (s.rafId !== null) cancelAnimationFrame(s.rafId);
    };
  }, [loop]);

  /* ── 4. DPR & Canvas Resizing ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const applySize = () => {
      const s = state.current;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;
      s.dpr = dpr;
      s.canvasW = w;
      s.canvasH = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    applySize();

    const ro = new ResizeObserver(applySize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: '#c02120',
      }}
      aria-label="Interactive cursor-tracking character animation"
    />
  );
}
