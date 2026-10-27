'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LazyMotion, domAnimation } from 'motion/react';
import * as m from 'motion/react-m';
import './reducedMotion';
import { useInView, prefersReducedMotion } from './inView';
import { RoadmapCard, JourneyCard, ROADMAP_SIZE, JOURNEY_SIZE } from './FrameworkCards';
import { BackgroundIcons, IconWrapperContext, type BgIcon } from '@/components/decor/BackgroundIcons';

// Small client-side motion helpers for the (server-rendered) landing page. All animate transform/opacity
// only, start once when scrolled into view, and carry .m-final so reduced motion shows the final state.
// Entrances that only fade and rise are CSS transitions (.reveal in globals.css), so the browser runs them
// off the main thread. The SVG drawings still use Motion, through its slim `m` components: only the
// animation features the page uses are loaded (MotionFeatures below), not the whole library.

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Motion features for the whole landing page ---------- */

export const MotionFeatures: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);

/* ---------- Reveal on scroll ---------- */

const useReveal = <T extends HTMLElement>(amount: number) => {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount });
  return [ref, inView] as const;
};

export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const [ref, inView] = useReveal<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={`reveal m-final ${inView ? 'revealed' : ''} ${className}`}
      style={delay ? ({ '--reveal-delay': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
};

// One list item; items that enter together still arrive one after another
export const RevealItem: React.FC<{ children: React.ReactNode; className?: string; index: number }> = ({
  children,
  className = '',
  index,
}) => {
  const [ref, inView] = useReveal<HTMLLIElement>(0.6);
  return (
    <li
      ref={ref}
      className={`reveal m-final ${inView ? 'revealed' : ''} ${className}`}
      style={{ '--reveal-y': '16px', '--reveal-dur': '0.5s', '--reveal-delay': `${0.08 + index * 0.1}s` } as React.CSSProperties}
    >
      {children}
    </li>
  );
};

/* ---------- Count up ---------- */

// cubic-bezier(0, 0, 0.58, 1), the standard "ease-out" curve
const easeOut = (t: number) => {
  const bez = (s: number, a: number, b: number) => 3 * a * (1 - s) * (1 - s) * s + 3 * b * (1 - s) * s * s + s * s * s;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, 0, 0.58) < t) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2, 0, 1);
};

// Server-renders the real number; in the browser it resets to 0 and counts up once it scrolls into view
export const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const ready = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!ready.current) {
      ready.current = true;
      if (!inView) el.textContent = '0';
    }
    if (!inView) return;
    const duration = Math.min(1.6, 0.6 + value / 150) * 1000;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(value * easeOut(t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return <span ref={ref}>{value}</span>;
};

/* ---------- Background icon field ---------- */

// The shared background icons (placed clear of all content), plus a slow drift and a little scroll
// parallax on the landing page. Each section passes its own hand-placed list; the section element
// carries data-icon-scope so the icons are checked against that section's content.
//
// Parallax: the section's position is measured once (and again only when the page changes size); on
// scroll, a passive listener batches into one frame and only writes each icon's transform. Icons only
// move while their section is on screen, and only then carry will-change (see globals.css).

const TRAVEL = 12; // px of parallax travel either way
const ParallaxContext = createContext<((el: HTMLElement | null, speed: number) => void) | null>(null);

const ParallaxIcon: React.FC<{ index: number; style: React.CSSProperties; children: React.ReactNode }> = ({ index, style, children }) => {
  const register = useContext(ParallaxContext)!;
  const speed = 0.5 + (index % 4) * 0.25;
  const ref = useCallback((el: HTMLDivElement | null) => register(el, speed), [register, speed]);
  return (
    <div ref={ref} data-parallax="" style={style}>
      {children}
    </div>
  );
};

export const IconField: React.FC<{ icons: BgIcon[] }> = ({ icons }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const icon = useRef(new Map<HTMLElement, number>());
  const layout = useRef({ top: 0, height: 0, screenH: 0 });
  const live = useRef({ visible: false, still: false, frame: 0 });

  // Scroll progress through the section: 0 when its top reaches the bottom of the screen, 1 when its
  // bottom leaves the top (the same range as before)
  const apply = useCallback((el?: HTMLElement) => {
    const { top, height, screenH } = layout.current;
    const span = height + screenH;
    const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY + screenH - top) / span)) : 0;
    const write = (target: HTMLElement, speed: number) => {
      const y = live.current.still ? 0 : TRAVEL * speed * (1 - 2 * p);
      target.style.transform = y ? `translateY(${y.toFixed(2)}px)` : 'none';
    };
    if (el) write(el, icon.current.get(el) ?? 0);
    else icon.current.forEach((speed, target) => write(target, speed));
  }, []);

  const register = useCallback(
    (el: HTMLElement | null, speed: number) => {
      if (!el) return;
      icon.current.set(el, speed);
      apply(el);
    },
    [apply]
  );

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const state = live.current;
    state.still = prefersReducedMotion();
    // Forget icons that have been removed
    const prune = () => icon.current.forEach((_, el) => !el.isConnected && icon.current.delete(el));

    const measure = () => {
      const rect = host.getBoundingClientRect();
      layout.current = { top: rect.top + window.scrollY, height: rect.height, screenH: window.innerHeight };
      prune();
      apply();
    };
    const onScroll = () => {
      if (!state.visible || state.frame) return;
      state.frame = requestAnimationFrame(() => {
        state.frame = 0;
        apply();
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      cancelAnimationFrame(state.frame);
    };
  }, [apply]);

  // Catch up as soon as the section comes back on screen
  useEffect(() => {
    live.current.visible = visible;
    if (visible) apply();
  }, [visible, apply]);

  return (
    <div ref={ref} aria-hidden="true" data-decor="" data-icon-field="" data-paused={visible ? undefined : ''} className="pointer-events-none absolute inset-0 overflow-hidden">
      <ParallaxContext.Provider value={register}>
        <IconWrapperContext.Provider value={ParallaxIcon}>
          {/* Keep clear of the scroll trail on the right edge */}
          <BackgroundIcons icons={icons} animated travel={TRAVEL} reserveRight={48} />
        </IconWrapperContext.Provider>
      </ParallaxContext.Provider>
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
  const [phase, setPhase] = useState<'static' | 'ready' | 'on'>('static');

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setPhase(inView ? 'on' : (p) => (p === 'static' ? 'ready' : p));
  }, [inView]);

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
      <m.g
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
      </m.g>
    </svg>
  );
};
