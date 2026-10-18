'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import './reducedMotion';
import { SECTION_NAV_EVENT, goToSection, navbarHeight } from './sectionNav';

// Section navigator on the right edge of the landing page.
// 1280px and up: one circle per section (data-milestone="Name" plus an id), spaced evenly down a rail.
// The marigold dot sits on the active section (the one filling most of the screen; always the first at
// the very top and the last at the very bottom) and glides to the next circle when that changes. The rail
// is solid terracotta down to the active circle and dotted below it. Clicking a circle scrolls its section
// to just below the navbar. A small label shows on hover/focus and briefly when a new section becomes
// active, only when every label fits between the content and the rail.
// Under 1280px: a thin progress line along the right edge (decorative), no circles or labels.

const TOP = 88; // first circle, below the navbar
const BOTTOM = 28;
const LINE_FROM_RIGHT = 18; // px from the screen's right edge to the line
const HIT = 24; // clickable size of each circle
const LABEL_GAP = 10; // between a label and the circle's hit area
const ARRIVAL_MS = 1500;
const SETTLE_MS = 160; // a click-scroll counts as finished after this long without scrolling
const CONTENT_MAX = 1280;

interface Section {
  id: string;
  label: string;
  el: HTMLElement;
}

// Right edge of the page content (inside its side padding)
const contentRight = (screenW: number) => (screenW + Math.min(screenW, CONTENT_MAX)) / 2 - (screenW >= 1024 ? 32 : screenW >= 640 ? 24 : 16);

export const ScrollTrail: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [sections, setSections] = useState<Section[]>([]);
  const [railH, setRailH] = useState(0);
  const [labelRoom, setLabelRoom] = useState(0);
  const [labelW, setLabelW] = useState(Infinity);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [arrival, setArrival] = useState<{ index: number; key: number } | null>(null);

  const sectionsRef = useRef<Section[]>([]);
  const activeRef = useRef(-1);
  const arrivalTimer = useRef(0);
  const frame = useRef(0);
  const measureRef = useRef<HTMLDivElement>(null);
  // While a click-scroll runs, the dot stays on its target
  const lock = useRef<{ settle: number; max: number; top: number } | null>(null);

  const show = useCallback((index: number) => {
    if (index === activeRef.current) return;
    const first = activeRef.current === -1;
    activeRef.current = index;
    setActive(index);
    if (first) return;
    window.clearTimeout(arrivalTimer.current);
    setArrival({ index, key: Date.now() });
    arrivalTimer.current = window.setTimeout(() => setArrival(null), ARRIVAL_MS);
  }, []);

  // The section filling most of the screen below the navbar (the footer counts as part of the last one)
  const computeActive = useCallback(() => {
    const list = sectionsRef.current;
    if (!list.length) return 0;
    const doc = document.documentElement;
    const vh = window.innerHeight;
    if (window.scrollY <= 2) return 0;
    if (window.scrollY + vh >= doc.scrollHeight - 2) return list.length - 1;
    const navB = navbarHeight();
    let best = 0;
    let bestVisible = -Infinity;
    list.forEach((s, i) => {
      const r = s.el.getBoundingClientRect();
      const bottom = i === list.length - 1 ? doc.scrollHeight - window.scrollY : r.bottom;
      const visible = Math.min(bottom, vh) - Math.max(r.top, navB);
      if (visible > bestVisible) {
        bestVisible = visible;
        best = i;
      }
    });
    return best;
  }, []);

  const measure = useCallback(() => {
    const list = [...document.querySelectorAll<HTMLElement>('[data-milestone]')]
      .filter((el) => el.id)
      .map((el) => ({ id: el.id, label: el.dataset.milestone || '', el }));
    sectionsRef.current = list;
    setSections(list);
    const screenW = document.documentElement.clientWidth;
    setRailH(Math.max(0, window.innerHeight - TOP - BOTTOM));
    setLabelRoom(screenW - LINE_FROM_RIGHT - HIT / 2 - LABEL_GAP - contentRight(screenW));
    if (!lock.current) show(computeActive());
  }, [computeActive, show]);

  useEffect(() => {
    measure();
    const raf = requestAnimationFrame(() => setReady(true));
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Follow the scroll, at most once per frame
  useEffect(() => {
    // When the click-scroll settles, the dot keeps its target, unless the page ended up somewhere else
    // (the user scrolled meanwhile): then it follows the screen again
    const release = () => {
      if (!lock.current) return;
      window.clearTimeout(lock.current.settle);
      window.clearTimeout(lock.current.max);
      const landed = Math.abs(window.scrollY - lock.current.top) <= 2;
      lock.current = null;
      if (!landed) show(computeActive());
    };
    const onScroll = () => {
      if (lock.current) {
        window.clearTimeout(lock.current.settle);
        lock.current.settle = window.setTimeout(release, SETTLE_MS);
        return;
      }
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        show(computeActive());
      });
    };
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; top: number }>).detail;
      const index = sectionsRef.current.findIndex((s) => s.id === detail?.id);
      if (index < 0) return;
      release();
      lock.current = { settle: window.setTimeout(release, SETTLE_MS * 2), max: window.setTimeout(release, 2000), top: detail.top };
      show(index);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', release);
    window.addEventListener(SECTION_NAV_EVENT, onNav);
    return () => {
      release();
      cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
      window.removeEventListener(SECTION_NAV_EVENT, onNav);
      window.clearTimeout(arrivalTimer.current);
    };
  }, [computeActive, show]);

  // Labels only show when the longest one fits between the content and the rail
  useLayoutEffect(() => {
    const measureLabels = () => {
      const spans = measureRef.current ? [...measureRef.current.children] : [];
      setLabelW(spans.length ? Math.max(...spans.map((s) => (s as HTMLElement).offsetWidth)) : Infinity);
    };
    measureLabels();
    document.fonts?.ready.then(measureLabels).catch(() => {});
  }, [sections]);

  const n = sections.length;
  const pos = (i: number) => (n > 1 ? (i / (n - 1)) * railH : 0);
  const labelsFit = labelW <= labelRoom;
  const labelIndex = hovered ?? arrival?.index ?? null;
  const labelKey = hovered !== null ? `h${hovered}` : `a${arrival?.key}`;

  // Thin line (under 1280px): the dot rides at the tip of the fill
  const thinDotY = useTransform(scrollYProgress, (p) => p * Math.max(0, (typeof window === 'undefined' ? 0 : window.innerHeight) - 65 - 10));

  const pill = 'whitespace-nowrap rounded-full border border-line bg-paper px-2.5 py-1 font-sans text-xs font-medium leading-none text-ink';

  return (
    <>
      {/* 1280px and up: the section navigator */}
      {railH > 0 && n > 0 && (
        <nav
          aria-label="Page sections"
          className={`hidden xl:block fixed z-30 ${ready ? 'rail-ready' : ''}`}
          style={{ top: TOP, right: LINE_FROM_RIGHT - HIT / 2, width: HIT, height: railH }}
        >
          {/* Ahead: dotted ink */}
          <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute left-[10px] top-0 h-full w-[4px] overflow-visible">
            <line x1="2" y1="0" x2="2" y2="100%" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0 9" className="text-ink/35" />
          </svg>
          {/* Behind: solid terracotta down to the active circle */}
          <div aria-hidden="true" className="rail-glide pointer-events-none absolute left-[10.5px] top-0 w-[3px] rounded-full bg-accent" style={{ height: pos(active) }} />

          <ol className="m-0 list-none p-0">
            {sections.map((s, i) => (
              <li key={s.id} className="absolute left-0" style={{ top: pos(i) - HIT / 2, width: HIT, height: HIT }}>
                <button
                  type="button"
                  aria-label={`Go to: ${s.label}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => goToSection(s.id)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered((h) => (h === i ? null : h))}
                  className="group flex h-6 w-6 cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-[14px] w-[14px] rounded-full border-2 transition-[background-color,border-color,transform] duration-200 group-hover:scale-110 ${
                      i <= active ? 'border-accent bg-accent' : 'border-ink/50 bg-paper'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>

          {/* The traveller: sits on the active circle (clicks pass through to the circle) */}
          <div
            aria-hidden="true"
            className="rail-glide pointer-events-none absolute left-[5px] top-0 -mt-[7px] h-[14px] w-[14px]"
            style={{ transform: `translateY(${pos(active)}px)` }}
          >
            <span className="trail-pulse absolute inset-0 rounded-full bg-marigold" />
            <span className="absolute inset-0 rounded-full border-2 border-[#1F2430] bg-marigold" />
          </div>

          {/* Label beside a circle */}
          {labelsFit && labelIndex !== null && sections[labelIndex] && (
            <span
              key={labelKey}
              aria-hidden="true"
              className={`trail-label pointer-events-none absolute ${pill}`}
              style={{ top: pos(labelIndex), right: HIT + LABEL_GAP, transform: 'translateY(-50%)' }}
            >
              {sections[labelIndex].label}
            </span>
          )}

          {/* Off-screen copies, to measure whether the labels fit */}
          <div ref={measureRef} aria-hidden="true" className="invisible pointer-events-none absolute right-0 top-0 flex flex-col items-end">
            {sections.map((s) => (
              <span key={s.id} className={pill}>
                {s.label}
              </span>
            ))}
          </div>
        </nav>
      )}

      {/* Under 1280px: a thin progress line along the right edge */}
      <div aria-hidden="true" data-decor="" className="xl:hidden fixed right-0 top-[65px] bottom-0 z-30 w-[3px] pointer-events-none">
        <div className="absolute inset-0 bg-ink/10" />
        <motion.div className="absolute inset-0 bg-accent origin-top" style={{ scaleY: scrollYProgress }} />
        <motion.span
          className="absolute -left-[3.5px] top-0 w-[10px] h-[10px] rounded-full bg-marigold border-[1.5px] border-[#1F2430]"
          style={{ y: thinDotY }}
        />
      </div>
    </>
  );
};
