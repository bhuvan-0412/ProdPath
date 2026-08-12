'use client';

import React, { useRef, useEffect, useCallback } from 'react';

export interface DotGridProps {
  dotSize?: number;
  dotSpacing?: number;
  dotColor?: string;
  glowColor?: string;
  proximityRadius?: number;
  shockwaveSpeed?: number;
  shockwaveIntensity?: number;
  resistance?: number;
  returnSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface DotPoint {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  targetRadius: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
}

export const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 3,
  dotSpacing = 28,
  dotColor = 'rgba(139, 92, 246, 0.40)',
  glowColor = 'rgba(167, 139, 250, 1.0)',
  proximityRadius = 130,
  shockwaveSpeed = 9,
  shockwaveIntensity = 16,
  resistance = 0.85,
  returnSpeed = 0.09,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<DotPoint[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef<boolean>(false);

  const initGrid = useCallback((width: number, height: number) => {
    const dots: DotPoint[] = [];
    const cols = Math.floor(width / dotSpacing);
    const rows = Math.floor(height / dotSpacing);
    const offsetX = (width - cols * dotSpacing) / 2 + dotSpacing / 2;
    const offsetY = (height - rows * dotSpacing) / 2 + dotSpacing / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * dotSpacing;
        const y = offsetY + r * dotSpacing;
        dots.push({
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: dotSize,
          baseRadius: dotSize,
          targetRadius: dotSize,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, dotSpacing]);

  const requestRender = useCallback(() => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      // Start loop if not already running
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initGrid(width, height);
      requestRender();
    };

    handleResize();
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);

    let isIntersecting = true;
    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) requestRender();
    });
    io.observe(container);

    const renderLoop = () => {
      if (!isIntersecting || !ctx) {
        isAnimatingRef.current = false;
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const dots = dotsRef.current;
      const shockwaves = shockwavesRef.current;

      let isMoving = mouse.active || shockwaves.length > 0;

      // Process shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const wave = shockwaves[i];
        wave.radius += shockwaveSpeed;
        if (wave.radius > wave.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // Update & render dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Mouse proximity physics
        if (mouse.active) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < proximityRadius && dist > 0) {
            const force = (1 - dist / proximityRadius) * 3.5;
            const angle = Math.atan2(dy, dx);
            dot.vx += Math.cos(angle) * force;
            dot.vy += Math.sin(angle) * force;
            dot.targetRadius = dot.baseRadius * (1 + (1 - dist / proximityRadius) * 1.4);
            isMoving = true;
          } else {
            dot.targetRadius = dot.baseRadius;
          }
        } else {
          dot.targetRadius = dot.baseRadius;
        }

        // Shockwave impulse physics
        for (let s = 0; s < shockwaves.length; s++) {
          const wave = shockwaves[s];
          const dx = dot.x - wave.x;
          const dy = dot.y - wave.y;
          const dist = Math.hypot(dx, dy);
          const diff = Math.abs(dist - wave.radius);

          if (diff < 35) {
            const waveForce = (1 - diff / 35) * wave.intensity;
            const angle = Math.atan2(dy, dx);
            dot.vx += Math.cos(angle) * waveForce;
            dot.vy += Math.sin(angle) * waveForce;
            isMoving = true;
          }
        }

        // Spring acceleration towards base position
        const homeDx = dot.baseX - dot.x;
        const homeDy = dot.baseY - dot.y;
        dot.vx += homeDx * returnSpeed;
        dot.vy += homeDy * returnSpeed;

        // Damping
        dot.vx *= resistance;
        dot.vy *= resistance;

        // Position update
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Check motion threshold
        if (Math.abs(dot.vx) > 0.01 || Math.abs(dot.vy) > 0.01 || Math.abs(homeDx) > 0.1 || Math.abs(homeDy) > 0.1) {
          isMoving = true;
        }

        // Radius interpolation
        dot.radius += (dot.targetRadius - dot.radius) * 0.12;

        // Draw dot
        const distFromBase = Math.hypot(dot.x - dot.baseX, dot.y - dot.baseY);
        const isDisplaced = distFromBase > 1.2 || dot.radius > dot.baseRadius * 1.1;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.8, dot.radius), 0, Math.PI * 2);
        ctx.fillStyle = isDisplaced ? glowColor : dotColor;
        ctx.fill();
      }

      if (isMoving) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      } else {
        isAnimatingRef.current = false;
      }
    };

    const startAnimation = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    startAnimation();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      io.disconnect();
      isAnimatingRef.current = false;
    };
  }, [initGrid, dotColor, glowColor, proximityRadius, shockwaveSpeed, resistance, returnSpeed, requestRender]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
    if (!isAnimatingRef.current) {
      requestRender();
    }
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shockwavesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: Math.max(rect.width, rect.height) * 0.8,
      intensity: shockwaveIntensity,
    });

    if (!isAnimatingRef.current) {
      requestRender();
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
};

export default DotGrid;
