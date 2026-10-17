'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import './reducedMotion';
import { RoadmapCard, JourneyCard, ROADMAP_SIZE, JOURNEY_SIZE } from './FrameworkCards';
import { ICON_PATHS, type IconKind } from '@/components/pmIcons';

export type { IconKind };

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

/* ---------- Pause CSS loops off-screen ---------- */

export const InViewPause: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} data-paused={visible ? undefined : ''} className={className} {...rest}>
      {children}
    </div>
  );
};

/* ---------- Background icon field ---------- */


export interface FieldIcon {
  kind: IconKind;
  /** Position inside the section, in percent */
  x: number;
  y: number;
  size: number;
  rot: number;
  /** Scroll parallax strength (px of travel across the section) */
  speed: number;
  /** Shown on phones too (about 6 in total across the page) */
  phone?: boolean;
}

const FieldIconItem: React.FC<{ icon: FieldIcon; index: number; progress: MotionValue<number>; still: boolean }> = ({
  icon,
  index,
  progress,
  still,
}) => {
  const y = useTransform(progress, [0, 1], [icon.speed, -icon.speed]);
  return (
    <motion.div
      className={`absolute ${icon.phone ? '' : 'hidden md:block'}`}
      style={{ left: `${icon.x}%`, top: `${icon.y}%`, y: still ? 0 : y }}
    >
      <svg
        viewBox="0 0 24 24"
        width={icon.size}
        height={icon.size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="icon-drift block"
        style={
          {
            rotate: `${icon.rot}deg`,
            '--dur': `${16 + (index % 4) * 3}s`,
            '--delay': `${-index * 2.3}s`,
            '--dx': `${index % 2 ? 7 : -6}px`,
            '--dy': `${index % 3 ? -9 : 7}px`,
          } as React.CSSProperties
        }
      >
        {ICON_PATHS[icon.kind]}
      </svg>
    </motion.div>
  );
};

// Faint outline icons behind a section's content. `tone` sets the strength: "hero" ~10%, "soft" lighter.
export const IconField: React.FC<{ icons: FieldIcon[]; tone?: 'hero' | 'soft' }> = ({ icons, tone = 'soft' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-paused={visible ? undefined : ''}
      className={`pointer-events-none absolute inset-0 overflow-hidden text-ink ${tone === 'hero' ? 'opacity-[0.10]' : 'opacity-[0.07]'}`}
    >
      {icons.map((icon, i) => (
        <FieldIconItem key={i} icon={icon} index={i} progress={scrollYProgress} still={!!reduce} />
      ))}
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
