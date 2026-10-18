'use client';

import React, { useEffect, useId, useMemo, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import './reducedMotion';
import {
  PersonaCard,
  WireflowCard,
  NorthStarCard,
  RiceCard,
  GtmCard,
  HeartCard,
  AiCard,
  PERSONA_SIZE,
  WIREFLOW_SIZE,
  NORTH_STAR_SIZE,
  RICE_SIZE,
  GTM_SIZE,
  HEART_SIZE,
  AI_SIZE,
  type CardProps,
} from './FrameworkCards';

// The hero illustration: the product lifecycle as a climb. A dotted trail zig-zags from the foot of the hill up
// a mountain to the gold summit flag, passing seven framework cards in order (Discover -> AI PM), with the
// AI card as the high point beside the flag. Decorative only (aria-hidden). Two layouts: all seven cards
// from 640px up; Persona, Wireframe, HEART and the AI card on phones.
//
// Animation (transform/opacity, plus the trail's reveal mask): the trail draws itself and each card pops in
// as the line reaches it, over about 3.2s; then the flag waves once. Afterwards the cards float (CSS, paused
// off-screen) and drift a few pixels against a mouse pointer. Reduced motion: everything shows finished.

type CardComponent = React.FC<CardProps>;
type Point = [number, number];

interface Placement {
  key: string;
  Card: CardComponent;
  size: { w: number; h: number };
  x: number;
  y: number;
  rot: number;
  /** Which trail stop it sits beside (index into Layout.stops); fractional = part-way along the next leg */
  stop: number;
  /** How strongly it shifts against the pointer (px at the screen edge) */
  depth: number;
  float: { px: number; dur: number; delay: number };
}

interface Layout {
  viewBox: { w: number; h: number };
  sun: { cx: number; cy: number; r: number };
  hills: [string, string, string];
  /** Trail: start point, the stops beside each card, and the flag at the end */
  start: Point;
  stops: Point[];
  flag: Point;
  cards: Placement[];
  sparkles: { x: number; y: number; s: number }[];
}

// Cards zig-zag up the hill in lifecycle order; the AI card sits nearest the summit, a little larger
const DESKTOP: Layout = {
  viewBox: { w: 680, h: 660 },
  sun: { cx: 604, cy: 46, r: 38 },
  hills: [
    'M0 660 L0 500 C 100 450, 240 220, 352 92 C 440 190, 570 350, 680 400 L680 660 Z',
    'M0 612 C 120 580, 250 592, 380 612 C 480 628, 590 600, 680 606 L680 660 L0 660 Z',
    'M0 644 C 140 630, 300 640, 420 646 C 520 652, 600 638, 680 642 L680 660 L0 660 Z',
  ],
  start: [290, 626],
  stops: [
    [222, 552],
    [458, 482],
    [206, 398],
    [462, 322],
    [216, 248],
    [398, 164],
    [350, 140],
  ],
  flag: [352, 92],
  cards: [
    { key: 'persona', Card: PersonaCard, size: PERSONA_SIZE, x: 12, y: 500, rot: -3, stop: 0, depth: 6, float: { px: 5, dur: 6.4, delay: 0 } },
    { key: 'wireflow', Card: WireflowCard, size: WIREFLOW_SIZE, x: 492, y: 430, rot: 2, stop: 1, depth: 5, float: { px: 5, dur: 6.8, delay: 3.4 } },
    { key: 'northstar', Card: NorthStarCard, size: NORTH_STAR_SIZE, x: 12, y: 336, rot: 2, stop: 2, depth: 7, float: { px: 4, dur: 7.2, delay: 1.2 } },
    { key: 'rice', Card: RiceCard, size: RICE_SIZE, x: 496, y: 268, rot: -2, stop: 3, depth: 6, float: { px: 6, dur: 5.6, delay: 2.4 } },
    { key: 'gtm', Card: GtmCard, size: GTM_SIZE, x: 12, y: 196, rot: -2, stop: 4, depth: 8, float: { px: 5, dur: 5.8, delay: 1.8 } },
    { key: 'heart', Card: HeartCard, size: HEART_SIZE, x: 430, y: 112, rot: 2, stop: 5, depth: 5, float: { px: 5, dur: 6.6, delay: 2.9 } },
    { key: 'ai', Card: AiCard, size: AI_SIZE, x: 12, y: 14, rot: -1.5, stop: 6, depth: 3, float: { px: 4, dur: 7.6, delay: 0.6 } },
  ],
  sparkles: [
    { x: 650, y: 240, s: 0.7 },
    { x: 40, y: 480, s: 0.7 },
    { x: 452, y: 42, s: 0.8 },
    // Two tiny ones beside the AI card
    { x: 26, y: 182, s: 0.5 },
    { x: 300, y: 181, s: 0.45 },
  ],
};

// Phones: Persona, Wireframe, HEART and the AI card, with the trail climbing up the right-hand side
const PHONE: Layout = {
  viewBox: { w: 400, h: 620 },
  sun: { cx: 372, cy: 34, r: 20 },
  hills: [
    'M0 620 L0 500 C 80 470, 250 300, 362 120 C 380 160, 394 200, 400 220 L400 620 Z',
    'M0 580 C 90 560, 200 568, 280 584 C 330 594, 370 580, 400 582 L400 620 L0 620 Z',
    'M0 608 C 100 598, 220 604, 300 610 C 350 614, 380 604, 400 606 L400 620 L0 620 Z',
  ],
  start: [292, 600],
  stops: [
    [222, 520],
    [306, 390],
    [282, 256],
    [338, 160],
  ],
  flag: [362, 120],
  cards: [
    { key: 'persona', Card: PersonaCard, size: PERSONA_SIZE, x: 12, y: 470, rot: -2, stop: 0, depth: 0, float: { px: 4, dur: 6.4, delay: 0 } },
    { key: 'wireflow', Card: WireflowCard, size: WIREFLOW_SIZE, x: 78, y: 340, rot: 2, stop: 1, depth: 0, float: { px: 4, dur: 6.8, delay: 3.4 } },
    { key: 'heart', Card: HeartCard, size: HEART_SIZE, x: 12, y: 206, rot: -2, stop: 2, depth: 0, float: { px: 4, dur: 6.6, delay: 2.9 } },
    { key: 'ai', Card: AiCard, size: AI_SIZE, x: 8, y: 18, rot: -1.5, stop: 3, depth: 0, float: { px: 3, dur: 7.6, delay: 0.6 } },
  ],
  sparkles: [
    { x: 24, y: 188, s: 0.5 },
    { x: 382, y: 300, s: 0.6 },
    { x: 40, y: 456, s: 0.6 },
  ],
};

/* ---------- Trail geometry ---------- */

// Each leg leaves and arrives vertically, so the trail switches back smoothly between the card columns
const legs = (layout: Layout) => {
  const points = [layout.start, ...layout.stops, layout.flag];
  return points.slice(1).map((q, i) => {
    const p = points[i];
    const dy = q[1] - p[1];
    return [p, [p[0], p[1] + dy * 0.5], [q[0], q[1] - dy * 0.5], q] as [Point, Point, Point, Point];
  });
};

const bezier = ([p0, p1, p2, p3]: [Point, Point, Point, Point], t: number): Point => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

const legLength = (leg: [Point, Point, Point, Point]) => {
  let len = 0;
  let prev = leg[0];
  for (let i = 1; i <= 32; i++) {
    const pt = bezier(leg, i / 32);
    len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
    prev = pt;
  }
  return len;
};

const useTrail = (layout: Layout) =>
  useMemo(() => {
    const ls = legs(layout);
    const d = `M${layout.start[0]} ${layout.start[1]} ` + ls.map(([, c1, c2, q]) => `C ${c1.join(' ')}, ${c2.join(' ')}, ${q.join(' ')}`).join(' ');
    const lengths = ls.map(legLength);
    const total = lengths.reduce((a, b) => a + b, 0);
    // Fraction of the whole trail at stop k (k may be fractional: part-way along the next leg)
    const at = (k: number) => {
      const whole = Math.floor(k);
      let len = lengths.slice(0, whole + 1).reduce((a, b) => a + b, 0);
      len += (k - whole) * (lengths[whole + 1] || 0);
      return len / total;
    };
    return { d, at };
  }, [layout]);

/* ---------- Scene ---------- */

const SPARKLE = 'M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z';
const EASE = [0.22, 1, 0.36, 1] as const;
const DRAW_START = 0.3;
const DRAW_SECONDS = 3.2;

const CardSlot: React.FC<{
  placement: Placement;
  appearAt: number;
  on: boolean;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
}> = ({ placement, appearAt, on, pointer }) => {
  const { Card, size, x, y, rot, depth, float } = placement;
  // Shift against the pointer: pointer right -> card left
  const px = useTransform(pointer.x, (v) => -v * depth);
  const py = useTransform(pointer.y, (v) => -v * depth * 0.6);

  return (
    <motion.g
      data-card={placement.key}
      className="m-final"
      initial={{ opacity: 0, scale: 0.86, y: 12 }}
      animate={on ? { opacity: 1, scale: 1, y: 0 } : undefined}
      transition={{ delay: appearAt, duration: 0.45, ease: EASE }}
    >
      <motion.g style={{ x: px, y: py }}>
        <g
          className="illo-float"
          style={{ '--float': `${-float.px}px`, '--dur': `${float.dur}s`, '--delay': `${-float.delay}s` } as React.CSSProperties}
        >
          <g transform={`translate(${x} ${y}) rotate(${rot} ${size.w / 2} ${size.h / 2})`}>
            <Card on={on} delay={appearAt + 0.3} />
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
  const id = useId().replace(/:/g, '');
  const { w, h } = layout.viewBox;
  const { d, at } = useTrail(layout);
  const timeAt = (frac: number) => DRAW_START + frac * DRAW_SECONDS;
  const [fx, fy] = layout.flag;

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
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width={w} height={h} rx="12" />
        </clipPath>
        {/* The trail is revealed by a solid stroke that draws along the same path */}
        <mask id={`${id}-reveal`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <motion.path
            className="m-final-path"
            d={d}
            fill="none"
            stroke="white"
            strokeWidth="14"
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={entered ? { pathLength: 1 } : undefined}
            transition={{ delay: DRAW_START, duration: DRAW_SECONDS, ease: 'linear' }}
          />
        </mask>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect className="illo-sky" x="0" y="0" width={w} height={h} fill="#F6F1E7" />
        <circle className="illo-sun" cx={layout.sun.cx} cy={layout.sun.cy} r={layout.sun.r} fill="#F3D9CC" />
        <path d={layout.hills[0]} fill="#EBC3AE" />
        <path d={layout.hills[1]} fill="#D98E6C" />
        <path d={layout.hills[2]} fill="#9E4524" />

        {/* Trail up to the summit flag */}
        <path data-trail d={d} fill="none" stroke="#1F2430" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 9" mask={`url(#${id}-reveal)`} />
        {/* Trailhead at the foot of the hill */}
        <circle cx={layout.start[0]} cy={layout.start[1]} r="3.5" fill="#1F2430" />
        {layout.stops.map(([cx, cy], i) => (
          <motion.circle
            key={`${cx}-${cy}`}
            className="m-final"
            cx={cx}
            cy={cy}
            r="5.5"
            fill="#FBF8F1"
            stroke="#1F2430"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={entered ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: timeAt(at(i)) - 0.05, duration: 0.25 }}
          />
        ))}

        {/* Summit flag: waves once when the trail arrives */}
        <line x1={fx} y1={fy} x2={fx} y2={fy - 46} stroke="#1F2430" strokeWidth="2.5" strokeLinecap="round" />
        <motion.path
          className="m-final"
          d={`M${fx} ${fy - 46} L${fx + 28} ${fy - 36} L${fx} ${fy - 26} Z`}
          fill="#E8B04A"
          stroke="#1F2430"
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={{ originX: 0, originY: 0.5 }}
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={entered ? { opacity: 1, scaleX: [0.2, 1, 0.82, 1.04, 0.94, 1], skewY: [0, -6, 4, -3, 1, 0] } : undefined}
          transition={{ delay: DRAW_START + DRAW_SECONDS - 0.1, duration: 1.2, ease: 'easeInOut' }}
        />

        {layout.cards.map((placement) => (
          <CardSlot key={placement.key} placement={placement} appearAt={Math.max(0.15, timeAt(at(placement.stop)) - 0.15)} on={entered} pointer={pointer} />
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
