'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import './reducedMotion';
import {
  SwotCard,
  AarrrCard,
  HeartCard,
  FiveCsCard,
  LoopCard,
  MvpCard,
  SWOT_SIZE,
  AARRR_SIZE,
  HEART_SIZE,
  FIVE_CS_SIZE,
  LOOP_SIZE,
  MVP_SIZE,
  type CardProps,
} from './FrameworkCards';

// The hero illustration: six PM framework cards floating over terracotta hills, with a dotted trail up to a
// summit flag. Decorative only (aria-hidden). Two layouts: six cards from 640px up, four on phones.
//
// Motion, all transform/opacity: the cards pop in one after another, then each runs its own little
// animation; afterwards they float (CSS, paused off-screen) and drift a few pixels against a mouse pointer.
// Reduced motion: globals.css pins everything in its final state and the pointer effect is skipped.

type CardComponent = React.FC<CardProps>;

interface Placement {
  key: string;
  Card: CardComponent;
  size: { w: number; h: number };
  x: number;
  y: number;
  rot: number;
  /** How strongly it shifts against the pointer (px at the screen edge) */
  depth: number;
  float: { px: number; dur: number; delay: number };
}

interface Layout {
  viewBox: { w: number; h: number };
  sun: { cx: number; cy: number; r: number };
  hills: [string, string, string];
  trail: string;
  stops: [number, number][];
  flag: { x: number; y: number };
  cards: Placement[];
  sparkles: { x: number; y: number; s: number }[];
}

const DESKTOP: Layout = {
  viewBox: { w: 680, h: 440 },
  sun: { cx: 560, cy: 118, r: 64 },
  hills: [
    'M0 330 C 90 300, 170 300, 250 320 C 320 338, 350 255, 410 250 C 470 246, 520 300, 600 305 C 640 308, 660 300, 680 296 L680 440 L0 440 Z',
    'M0 385 C 90 335, 200 345, 290 368 C 400 398, 500 345, 680 362 L680 440 L0 440 Z',
    'M0 420 C 120 392, 260 406, 360 416 C 460 426, 580 398, 680 408 L680 440 L0 440 Z',
  ],
  trail: 'M110 410 C 160 402, 210 408, 245 386 C 290 360, 330 352, 360 320 C 380 298, 395 272, 410 252',
  stops: [
    [245, 386],
    [360, 320],
  ],
  flag: { x: 410, y: 252 },
  cards: [
    { key: 'swot', Card: SwotCard, size: SWOT_SIZE, x: 26, y: 26, rot: -4, depth: 7, float: { px: 5, dur: 6.4, delay: 0 } },
    { key: 'aarrr', Card: AarrrCard, size: AARRR_SIZE, x: 202, y: 18, rot: 3, depth: 4, float: { px: 6, dur: 5.4, delay: 1.6 } },
    { key: 'heart', Card: HeartCard, size: HEART_SIZE, x: 406, y: 22, rot: -2, depth: 8, float: { px: 4, dur: 7.4, delay: 3 } },
    { key: '5cs', Card: FiveCsCard, size: FIVE_CS_SIZE, x: 30, y: 184, rot: 2, depth: 5, float: { px: 5, dur: 8, delay: 4.2 } },
    { key: 'loop', Card: LoopCard, size: LOOP_SIZE, x: 472, y: 150, rot: -3, depth: 6, float: { px: 6, dur: 6.8, delay: 2.2 } },
    { key: 'mvp', Card: MvpCard, size: MVP_SIZE, x: 226, y: 184, rot: -5, depth: 3, float: { px: 4, dur: 5.8, delay: 0.8 } },
  ],
  sparkles: [
    { x: 206, y: 168, s: 0.75 },
    { x: 452, y: 138, s: 0.9 },
    { x: 664, y: 132, s: 0.7 },
  ],
};

const PHONE: Layout = {
  viewBox: { w: 400, h: 470 },
  sun: { cx: 330, cy: 160, r: 54 },
  hills: [
    'M0 384 C 60 364, 120 366, 180 376 C 230 384, 270 342, 316 340 C 352 338, 378 356, 400 352 L400 470 L0 470 Z',
    'M0 420 C 80 395, 160 405, 230 418 C 300 430, 350 405, 400 412 L400 470 L0 470 Z',
    'M0 452 C 90 438, 200 446, 260 450 C 320 454, 370 440, 400 444 L400 470 L0 470 Z',
  ],
  trail: 'M60 456 C 110 446, 170 444, 210 426 C 250 408, 290 372, 316 340',
  stops: [
    [210, 426],
    [281, 384],
  ],
  flag: { x: 316, y: 340 },
  cards: [
    { key: 'swot', Card: SwotCard, size: SWOT_SIZE, x: 14, y: 20, rot: -4, depth: 0, float: { px: 5, dur: 6.4, delay: 0 } },
    { key: 'aarrr', Card: AarrrCard, size: AARRR_SIZE, x: 204, y: 16, rot: 3, depth: 0, float: { px: 6, dur: 5.4, delay: 1.6 } },
    { key: 'loop', Card: LoopCard, size: LOOP_SIZE, x: 16, y: 178, rot: -3, depth: 0, float: { px: 6, dur: 6.8, delay: 2.2 } },
    { key: 'mvp', Card: MvpCard, size: MVP_SIZE, x: 224, y: 178, rot: 4, depth: 0, float: { px: 4, dur: 5.8, delay: 0.8 } },
  ],
  sparkles: [
    { x: 192, y: 168, s: 0.75 },
    { x: 388, y: 290, s: 0.7 },
    { x: 214, y: 322, s: 0.85 },
  ],
};

const SPARKLE = 'M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z';
const EASE = [0.22, 1, 0.36, 1] as const;

const CardSlot: React.FC<{
  placement: Placement;
  index: number;
  on: boolean;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
}> = ({ placement, index, on, pointer }) => {
  const { Card, size, x, y, rot, depth, float } = placement;
  // Shift against the pointer: pointer right -> card left
  const px = useTransform(pointer.x, (v) => -v * depth);
  const py = useTransform(pointer.y, (v) => -v * depth * 0.6);
  const enter = 0.15 + index * 0.14;

  return (
    <motion.g
      data-card={placement.key}
      className="m-final"
      initial={{ opacity: 0, scale: 0.86, y: 14 }}
      animate={on ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ delay: enter, duration: 0.5, ease: EASE }}
    >
      <motion.g style={{ x: px, y: py }}>
        <g
          className="illo-float"
          style={{ '--float': `${-float.px}px`, '--dur': `${float.dur}s`, '--delay': `${-float.delay}s` } as React.CSSProperties}
        >
          <g transform={`translate(${x} ${y}) rotate(${rot} ${size.w / 2} ${size.h / 2})`}>
            <Card on={on} delay={enter + 0.4} />
          </g>
        </g>
      </motion.g>
    </motion.g>
  );
};

const Scene: React.FC<{
  layout: Layout;
  className: string;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
}> = ({ layout, className, pointer }) => {
  const ref = useRef<SVGSVGElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.25 });
  const visible = useInView(ref);
  const { w, h } = layout.viewBox;
  const clipId = `hero-clip-${w}`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      data-paused={visible ? undefined : ''}
      className={`illo block w-full h-auto ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={w} height={h} rx="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect className="illo-sky" x="0" y="0" width={w} height={h} fill="#F6F1E7" />
        <circle className="illo-sun" cx={layout.sun.cx} cy={layout.sun.cy} r={layout.sun.r} fill="#F3D9CC" />
        <path d={layout.hills[0]} fill="#EBC3AE" />
        <path d={layout.hills[1]} fill="#D98E6C" />
        <path d={layout.hills[2]} fill="#9E4524" />

        {/* Trail up to the summit flag */}
        <path d={layout.trail} fill="none" stroke="#1F2430" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 9" />
        {layout.stops.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
        ))}
        <line x1={layout.flag.x} y1={layout.flag.y} x2={layout.flag.x} y2={layout.flag.y - 46} stroke="#1F2430" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d={`M${layout.flag.x} ${layout.flag.y - 46} L${layout.flag.x + 28} ${layout.flag.y - 36} L${layout.flag.x} ${layout.flag.y - 26} Z`}
          fill="#E8B04A"
          stroke="#1F2430"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {layout.cards.map((placement, i) => (
          <CardSlot key={placement.key} placement={placement} index={i} on={entered} pointer={pointer} />
        ))}

        {layout.sparkles.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.s})`}>
            <path
              className="illo-twinkle"
              style={{ '--dur': `${3.4 + i * 0.5}s`, '--delay': `${-i * 1.3}s` } as React.CSSProperties}
              d={SPARKLE}
              fill="#E8B04A"
              stroke="#1F2430"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

export const HeroScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.6 });

  // Pointer parallax: desktop mice only, never on touch screens or with reduced motion
  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, rawX, rawY]);

  const pointer = { x, y };
  return (
    <div className={className}>
      <Scene layout={DESKTOP} className="hidden sm:block" pointer={pointer} />
      <Scene layout={PHONE} className="sm:hidden" pointer={pointer} />
    </div>
  );
};
