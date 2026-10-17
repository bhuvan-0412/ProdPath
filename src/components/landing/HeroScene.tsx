'use client';

import React, { useEffect, useId, useMemo, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from 'motion/react';
import './reducedMotion';
import {
  PersonaCard,
  SwotCard,
  RiceCard,
  WireflowCard,
  KanbanCard,
  GtmCard,
  HeartCard,
  PERSONA_SIZE,
  SWOT_SIZE,
  RICE_SIZE,
  WIREFLOW_SIZE,
  KANBAN_SIZE,
  GTM_SIZE,
  HEART_SIZE,
  type CardProps,
} from './FrameworkCards';

// The hero illustration: the product lifecycle as a climb. A dotted trail zig-zags from the bottom-left up a
// mountain to the gold summit flag, passing seven framework cards in order (Discover -> Measure).
// Decorative only (aria-hidden). Two layouts: all seven cards from 640px up, four on phones.
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

const DESKTOP: Layout = {
  viewBox: { w: 680, h: 620 },
  sun: { cx: 604, cy: 46, r: 38 },
  hills: [
    'M0 620 L0 470 C 100 420, 230 200, 330 76 C 420 170, 560 330, 680 380 L680 620 Z',
    'M0 572 C 120 540, 250 552, 380 572 C 480 588, 590 560, 680 566 L680 620 L0 620 Z',
    'M0 604 C 140 590, 300 600, 420 606 C 520 612, 600 598, 680 602 L680 620 L0 620 Z',
  ],
  start: [252, 612],
  stops: [
    [214, 532],
    [468, 438],
    [212, 360],
    [466, 286],
    [214, 214],
    [468, 146],
  ],
  flag: [330, 76],
  // Cards follow the stops in order; HEART sits beside the last leg, on the way to the flag
  cards: [
    { key: 'persona', Card: PersonaCard, size: PERSONA_SIZE, x: 12, y: 452, rot: -3, stop: 0, depth: 6, float: { px: 5, dur: 6.4, delay: 0 } },
    { key: 'swot', Card: SwotCard, size: SWOT_SIZE, x: 508, y: 372, rot: 3, stop: 1, depth: 4, float: { px: 4, dur: 7.2, delay: 1.2 } },
    { key: 'rice', Card: RiceCard, size: RICE_SIZE, x: 12, y: 304, rot: 2, stop: 2, depth: 7, float: { px: 6, dur: 5.6, delay: 2.4 } },
    { key: 'wireflow', Card: WireflowCard, size: WIREFLOW_SIZE, x: 494, y: 232, rot: -2, stop: 3, depth: 5, float: { px: 5, dur: 6.8, delay: 3.4 } },
    { key: 'kanban', Card: KanbanCard, size: KANBAN_SIZE, x: 12, y: 158, rot: -2, stop: 4, depth: 8, float: { px: 4, dur: 7.8, delay: 0.6 } },
    { key: 'gtm', Card: GtmCard, size: GTM_SIZE, x: 498, y: 94, rot: 3, stop: 5, depth: 5, float: { px: 6, dur: 5.8, delay: 1.8 } },
    { key: 'heart', Card: HeartCard, size: HEART_SIZE, x: 12, y: 18, rot: -2, stop: 5.6, depth: 6, float: { px: 5, dur: 6.6, delay: 2.9 } },
  ],
  sparkles: [
    { x: 642, y: 354, s: 0.8 },
    { x: 40, y: 288, s: 0.75 },
    { x: 430, y: 40, s: 0.9 },
  ],
};

const PHONE: Layout = {
  viewBox: { w: 400, h: 540 },
  sun: { cx: 352, cy: 64, r: 30 },
  hills: [
    'M0 540 L0 420 C 80 380, 250 250, 330 160 C 360 200, 385 260, 400 280 L400 540 Z',
    'M0 500 C 90 470, 200 480, 280 500 C 330 512, 370 495, 400 498 L400 540 L0 540 Z',
    'M0 528 C 100 516, 220 524, 300 530 C 350 534, 380 524, 400 526 L400 540 L0 540 Z',
  ],
  start: [330, 530],
  stops: [
    [200, 448],
    [200, 350],
    [200, 254],
  ],
  flag: [330, 160],
  cards: [
    { key: 'persona', Card: PersonaCard, size: PERSONA_SIZE, x: 12, y: 390, rot: -2, stop: 0, depth: 0, float: { px: 4, dur: 6.4, delay: 0 } },
    { key: 'wireflow', Card: WireflowCard, size: WIREFLOW_SIZE, x: 214, y: 298, rot: 2, stop: 1, depth: 0, float: { px: 4, dur: 6.8, delay: 3.4 } },
    { key: 'kanban', Card: KanbanCard, size: KANBAN_SIZE, x: 12, y: 196, rot: -2, stop: 2, depth: 0, float: { px: 4, dur: 7.8, delay: 0.6 } },
    { key: 'heart', Card: HeartCard, size: HEART_SIZE, x: 12, y: 32, rot: -2, stop: 2.6, depth: 0, float: { px: 4, dur: 6.6, delay: 2.9 } },
  ],
  sparkles: [
    { x: 300, y: 262, s: 0.7 },
    { x: 40, y: 352, s: 0.75 },
    { x: 380, y: 196, s: 0.8 },
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
