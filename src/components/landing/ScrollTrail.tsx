'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import './reducedMotion';

// Scroll trail on the right edge of the landing page (decorative: hidden from screen readers).
// 1280px and up: a rail just inside the right margin. The stretch already scrolled past is a solid
// terracotta line, the stretch ahead stays dotted. A marigold dot travels with the scroll position; each
// landing section has a milestone ring that fills when the dot reaches it, with a short label beside the
// dot when there is room in the margin. Clicking a ring scrolls to its section. At the bottom, a flag waves.
// Under 1280px: a thin progress line along the right edge with the dot at its tip, no rings or labels.
//
// Sections opt in with data-milestone="Label". Where the margin is too narrow for the rail to sit clear of
// the hero illustration, the rail starts just below the hero.

const TOP = 88; // below the navbar
const BOTTOM = 28;
const LINE_FROM_RIGHT = 20; // px from the screen's right edge to the line
const CONTENT_MAX = 1280;

interface Milestone {
  label: string;
  el: HTMLElement;
  frac: number;
}

const contentRight = (screenW: number) => (screenW + Math.min(screenW, CONTENT_MAX)) / 2 - (screenW >= 1024 ? 32 : screenW >= 640 ? 24 : 16);

export const ScrollTrail: React.FC = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [rail, setRail] = useState({ top: TOP, height: 0, roomForLabels: 0, followHero: false });
  const [reached, setReached] = useState(-1);
  const [label, setLabel] = useState<{ index: number; key: number } | null>(null);
  const labelTimer = useRef(0);
  const heroRef = useRef<HTMLElement | null>(null);

  // Measure the rail and where each section sits along it
  const measure = useCallback(() => {
    const screenW = document.documentElement.clientWidth;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const sections = [...document.querySelectorAll<HTMLElement>('[data-milestone]')];
    heroRef.current = sections[0] || null;
    setMilestones(
      sections.map((el, i) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // A section counts as reached once its top is about a third of the way up the screen
        const frac = i === 0 ? 0 : Math.min(1, Math.max(0, (top - window.innerHeight * 0.35) / maxScroll));
        return { label: el.dataset.milestone || '', el, frac };
      })
    );
    const lineX = screenW - LINE_FROM_RIGHT;
    const margin = screenW - contentRight(screenW);
    setRail((r) => ({
      ...r,
      height: window.innerHeight - TOP - BOTTOM,
      // Space between the content edge and the dot, for a label
      roomForLabels: lineX - 7 - 10 - contentRight(screenW),
      // Narrow margins put the rail right beside the hero illustration: start it below the hero instead
      followHero: margin < 64,
    }));
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Rail top: fixed below the navbar, or just below the hero while the hero is on screen (narrow margins)
  const railTop = useMotionValue(TOP);
  const updateTop = useCallback(() => {
    if (!rail.followHero || !heroRef.current) {
      railTop.set(TOP);
      return;
    }
    railTop.set(Math.max(TOP, heroRef.current.getBoundingClientRect().bottom + 16));
  }, [rail.followHero, railTop]);
  useEffect(updateTop, [updateTop, milestones]);
  useMotionValueEvent(scrollY, 'change', updateTop);

  const fullHeight = rail.height;
  const usable = useTransform(railTop, (t) => Math.max(0, TOP + fullHeight - t));
  const dotY = useTransform([scrollYProgress, railTop, usable], ([p, t, h]: number[]) => t - TOP + p * h);
  // Thin line (under 1280px): the dot rides at the tip of the fill
  const thinDotY = useTransform(scrollYProgress, (p) => p * Math.max(0, (typeof window === 'undefined' ? 0 : window.innerHeight) - 65 - 10));
  const railOffset = useTransform(railTop, (t) => t - TOP);

  // Which milestone has the dot passed? Show its label briefly when it changes (and on arrival).
  const sync = useCallback(
    (p: number) => {
      let index = -1;
      milestones.forEach((m, i) => {
        if (p >= m.frac - 0.001) index = i;
      });
      setReached((current) => {
        if (index !== current && index >= 0) {
          window.clearTimeout(labelTimer.current);
          setLabel({ index, key: Date.now() });
          labelTimer.current = window.setTimeout(() => setLabel(null), 1800);
        }
        return index;
      });
    },
    [milestones]
  );
  useMotionValueEvent(scrollYProgress, 'change', sync);
  useEffect(() => {
    if (milestones.length) sync(scrollYProgress.get());
  }, [milestones, sync, scrollYProgress]);
  useEffect(() => () => window.clearTimeout(labelTimer.current), []);

  const atEnd = reached === milestones.length - 1 && milestones.length > 0;
  const labelText = label ? milestones[label.index]?.label : '';
  const labelFits = labelText ? labelText.length * 6.6 + 18 <= rail.roomForLabels : false;

  const goTo = (m: Milestone) => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = m.el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <div aria-hidden="true" data-decor="">
      {/* 1280px and up: the rail */}
      {fullHeight > 0 && (
        <div className="hidden xl:block fixed z-30 pointer-events-none" style={{ top: TOP, right: LINE_FROM_RIGHT - 14, width: 28, height: fullHeight }}>
          <motion.div className="absolute inset-x-0 bottom-0" style={{ top: railOffset }}>
            {/* Ahead: dotted ink */}
            <svg className="absolute left-[12px] top-0 h-full w-[4px] overflow-visible" focusable="false">
              <line x1="2" y1="0" x2="2" y2="100%" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0 9" className="text-ink/35" />
            </svg>
            {/* Behind: solid terracotta */}
            <motion.div className="absolute left-[12.5px] top-0 h-full w-[3px] rounded-full bg-accent origin-top" style={{ scaleY: scrollYProgress }} />

            {/* Milestones */}
            {milestones.map((m, i) => (
              <button
                key={m.label}
                type="button"
                tabIndex={-1}
                aria-label={`Scroll to ${m.label}`}
                onClick={() => goTo(m)}
                className={`pointer-events-auto absolute left-[7px] w-[14px] h-[14px] -mt-[7px] rounded-full border-2 transition-colors duration-200 cursor-pointer hover:scale-110 ${
                  i <= reached ? 'bg-accent border-accent' : 'bg-paper border-ink/50'
                }`}
                style={{ top: `${m.frac * 100}%` }}
              />
            ))}

            {/* The flag at the end of the trail */}
            <svg className="absolute left-[13px] -bottom-1 w-5 h-6 overflow-visible" viewBox="0 0 20 24" focusable="false">
              <line x1="1.5" y1="24" x2="1.5" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink/60" />
              <g className={atEnd ? 'flag-wave' : undefined}>
                <path d="M1.5 2 L17 7 L1.5 12 Z" fill="#E8B04A" stroke="#1F2430" strokeWidth="1.25" strokeLinejoin="round" />
              </g>
            </svg>
          </motion.div>

          {/* The traveller */}
          <motion.div className="absolute left-[7px] top-0 w-[14px] h-[14px] -mt-[7px]" style={{ y: dotY }}>
            <span className="trail-pulse absolute inset-0 rounded-full bg-marigold" />
            <span className="absolute inset-0 rounded-full bg-marigold border-2 border-[#1F2430]" />
            {label && labelFits && (
              <span
                key={label.key}
                className="trail-label absolute right-[22px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold leading-none text-paper"
              >
                {labelText}
              </span>
            )}
          </motion.div>
        </div>
      )}

      {/* Under 1280px: a thin progress line along the right edge */}
      <div className="xl:hidden fixed right-0 top-[65px] bottom-0 z-30 w-[3px] pointer-events-none">
        <div className="absolute inset-0 bg-ink/10" />
        <motion.div className="absolute inset-0 bg-accent origin-top" style={{ scaleY: scrollYProgress }} />
        <motion.span
          className="absolute -left-[3.5px] top-0 w-[10px] h-[10px] rounded-full bg-marigold border-[1.5px] border-[#1F2430]"
          style={{ y: thinDotY }}
        />
      </div>
    </div>
  );
};
