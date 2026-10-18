'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import './reducedMotion';
import { RoadmapCard, JourneyCard, ROADMAP_SIZE, JOURNEY_SIZE } from './FrameworkCards';
import { BackgroundIcons, IconWrapperContext, type BgIcon } from '@/components/decor/BackgroundIcons';

// Small client-side motion helpers for the (server-rendered) landing page. All animate transform/opacity
// only, start once when scrolled into view, and carry .m-final so reduced motion shows the final state.

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Reveal on scroll ---------- */

export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => (
  <motion.div
    className={`m-final ${className}`}
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

// One list item; items that enter together still arrive one after another
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string; index: number }> = ({
  children,
  className = '',
  index,
}) => (
  <motion.li
    className={`m-final ${className}`}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.5, delay: 0.08 + index * 0.1, ease: EASE }}
  >
    {children}
  </motion.li>
);

/* ---------- Count up ---------- */

// Server-renders the real number; in the browser it resets to 0 and counts up once it scrolls into view
export const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const ready = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    if (!ready.current) {
      ready.current = true;
      if (!inView) el.textContent = '0';
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration: Math.min(1.6, 0.6 + value / 150),
      ease: 'easeOut',
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{value}</span>;
};

/* ---------- Background icon field ---------- */

// The shared background icons (placed clear of all content), plus a slow drift and a little scroll
// parallax on the landing page. Each section passes its own hand-placed list; the section element
// carries data-icon-scope so the icons are checked against that section's content.

const TRAVEL = 12; // px of parallax travel either way
const ProgressContext = createContext<{ progress: MotionValue<number>; still: boolean } | null>(null);

const ParallaxIcon: React.FC<{ index: number; style: React.CSSProperties; children: React.ReactNode }> = ({ index, style, children }) => {
  const ctx = useContext(ProgressContext)!;
  const speed = 0.5 + (index % 4) * 0.25;
  const y = useTransform(ctx.progress, [0, 1], [TRAVEL * speed, -TRAVEL * speed]);
  return <motion.div style={{ ...style, y: ctx.still ? 0 : y }}>{children}</motion.div>;
};

export const IconField: React.FC<{ icons: BgIcon[] }> = ({ icons }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <div ref={ref} aria-hidden="true" data-decor="" data-paused={visible ? undefined : ''} className="pointer-events-none absolute inset-0 overflow-hidden">
      <ProgressContext.Provider value={{ progress: scrollYProgress, still: !!reduce }}>
        <IconWrapperContext.Provider value={ParallaxIcon}>
          {/* Keep clear of the scroll trail on the right edge */}
          <BackgroundIcons icons={icons} animated travel={TRAVEL} reserveRight={48} />
        </IconWrapperContext.Provider>
      </ProgressContext.Provider>
    </div>
  );
};

/* ---------- Sample activity grid wave ---------- */

export const ActivityWave: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'static' | 'ready' | 'on'>('static');

  useEffect(() => {
    if (reduce) return;
    setPhase(inView ? 'on' : (p) => (p === 'static' ? 'ready' : p));
  }, [inView, reduce]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`${className} ${phase === 'ready' ? 'wave-ready' : phase === 'on' ? 'wave-on' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
};

/* ---------- Roadmap and journey figures (path section) ---------- */

export const FrameworkFigure: React.FC<{ kind: 'roadmap' | 'journey'; className?: string }> = ({ kind, className = '' }) => {
  const ref = useRef<SVGSVGElement>(null);
  const on = useInView(ref, { once: true, amount: 0.5 });
  const size = kind === 'roadmap' ? ROADMAP_SIZE : JOURNEY_SIZE;
  const Card = kind === 'roadmap' ? RoadmapCard : JourneyCard;
  const rot = kind === 'roadmap' ? -2 : 2;
  return (
    <svg
      ref={ref}
      viewBox={`-6 -8 ${size.w + 16} ${size.h + 18}`}
      aria-hidden="true"
      focusable="false"
      className={`illo pointer-events-none block w-full h-auto ${className}`}
    >
      <g transform={`rotate(${rot} ${size.w / 2} ${size.h / 2})`}>
        <Card on={on} delay={0.15} />
      </g>
    </svg>
  );
};

/* ---------- Final call to action: summit flag on a small hill ---------- */

export const CtaSummit: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ref = useRef<SVGSVGElement>(null);
  const entered = useInView(ref, { once: true, amount: 0.4 });
  const visible = useInView(ref);
  return (
    <svg
      ref={ref}
      viewBox="0 0 320 180"
      aria-hidden="true"
      focusable="false"
      data-paused={visible ? undefined : ''}
      className={`pointer-events-none ${className}`}
    >
      <motion.g
        className="m-final"
        initial={{ opacity: 0, y: 26 }}
        animate={entered ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <path d="M150 180 C 200 136, 250 118, 320 120" fill="none" stroke="#F6F1E7" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 182 C 60 140, 110 78, 172 72 C 232 66, 282 128, 330 168" fill="#2A303D" stroke="#F6F1E7" strokeWidth="2" strokeLinecap="round" />
        <path d="M70 180 C 100 162, 120 140, 140 120 C 152 104, 160 92, 170 80" fill="none" stroke="#F6F1E7" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 9" />
        <circle cx="140" cy="120" r="5" fill="#2A303D" stroke="#F6F1E7" strokeWidth="2" />
        <g transform="rotate(3 172 72)">
          <g className="flag-wave">
            <path d="M176 26 L208 36 L176 46 Z" fill="#000000" fillOpacity="0.55" />
            <path d="M172 22 L204 32 L172 42 Z" fill="#E8B04A" stroke="#F6F1E7" strokeWidth="1.75" strokeLinejoin="round" />
          </g>
          <line x1="172" y1="72" x2="172" y2="20" stroke="#F6F1E7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </motion.g>
    </svg>
  );
};
