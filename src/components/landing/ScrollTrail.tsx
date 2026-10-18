'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import './reducedMotion';
import { goToSection, landingSections, sectionAnchors } from './sectionNav';

// Section navigator on the right edge of the landing page.
// 1280px and up: one circle per section (data-milestone="Name" plus an id), spaced evenly down a rail.
// The marigold dot follows the scroll position continuously: at a section's anchor (its top just below the
// navbar; the top of the page for the first, the very bottom for the last) it sits exactly on that circle,
// and between two anchors it sits proportionally between their circles. The rail is solid terracotta down
// to the dot and dotted below; circles fill once the dot reaches them. Clicking a circle scrolls to its
// anchor. A small label shows on hover/focus, and briefly when the dot arrives on a circle, only when every
// label fits between the content and the rail. The dot tracks the scroll with reduced motion too (it is a
// position readout, not decoration); only the click-scroll becomes instant.
// Under 1280px: a thin progress line along the right edge (decorative), no circles or labels.

const TOP = 88; // first circle, below the navbar
const BOTTOM = 28;
const LINE_FROM_RIGHT = 18; // px from the screen's right edge to the line
const HIT = 24; // clickable size of each circle
const LABEL_GAP = 10; // between a label and the circle's hit area
const ARRIVAL_MS = 1500;
const ARRIVAL_PX = 3; // the dot counts as "on" a circle within this distance
const CONTENT_MAX = 1280;

interface Section {
  id: string;
  label: string;
}

// Right edge of the page content (inside its side padding)
const contentRight = (screenW: number) => (screenW + Math.min(screenW, CONTENT_MAX)) / 2 - (screenW >= 1024 ? 32 : screenW >= 640 ? 24 : 16);

export const ScrollTrail: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [sections, setSections] = useState<Section[]>([]);
  const [railH, setRailH] = useState(0);
  const [labelRoom, setLabelRoom] = useState(0);
  const [labelW, setLabelW] = useState(Infinity);
  const [reached, setReached] = useState(0); // last circle the dot has reached
  const [nearest, setNearest] = useState(0); // circle nearest the dot (aria-current)
  const [hovered, setHovered] = useState<number | null>(null);
  const [arrival, setArrival] = useState<{ index: number; key: number } | null>(null);

  const anchors = useRef<number[]>([]);
  const railHRef = useRef(0);
  const dotRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const state = useRef({ reached: -1, nearest: -1, onCircle: null as number | null, started: false });
  const arrivalTimer = useRef(0);

  // Place the dot and the solid line for the current scroll position
  const update = useCallback(() => {
    const a = anchors.current;
    const n = a.length;
    const h = railHRef.current;
    if (!n || !dotRef.current || !fillRef.current) return;
    const y = window.scrollY;
    // Fractional circle index: k + share of the way to circle k + 1
    let f = 0;
    if (y >= a[n - 1]) f = n - 1;
    else if (y > a[0]) {
      for (let k = 0; k < n - 1; k++) {
        if (y <= a[k + 1]) {
          const span = a[k + 1] - a[k];
          f = k + (span > 0 ? (y - a[k]) / span : 1);
          break;
        }
      }
    }
    const step = n > 1 ? h / (n - 1) : 0;
    const dotY = f * step;
    dotRef.current.style.transform = `translateY(${dotY}px)`;
    fillRef.current.style.height = `${dotY}px`;

    const s = state.current;
    const near = Math.round(f);
    const reachedNow = step > 0 ? Math.floor(f + 0.5 / step) : 0;
    if (reachedNow !== s.reached) {
      s.reached = reachedNow;
      setReached(reachedNow);
    }
    if (near !== s.nearest) {
      s.nearest = near;
      setNearest(near);
    }
    // Arrival label: when the dot comes onto a circle (not for where the page happens to load)
    const on = Math.abs(dotY - near * step) <= ARRIVAL_PX ? near : null;
    if (on !== s.onCircle) {
      s.onCircle = on;
      if (on !== null && s.started) {
        window.clearTimeout(arrivalTimer.current);
        setArrival({ index: on, key: Date.now() });
        arrivalTimer.current = window.setTimeout(() => setArrival(null), ARRIVAL_MS);
      }
    }
    s.started = true;
  }, []);

  const measure = useCallback(() => {
    const els = landingSections();
    anchors.current = sectionAnchors(els);
    setSections((prev) => {
      const next = els.map((el) => ({ id: el.id, label: el.dataset.milestone || '' }));
      return prev.length === next.length && prev.every((p, i) => p.id === next[i].id && p.label === next[i].label) ? prev : next;
    });
    const screenW = document.documentElement.clientWidth;
    const h = Math.max(0, window.innerHeight - TOP - BOTTOM);
    railHRef.current = h;
    setRailH(h);
    setLabelRoom(screenW - LINE_FROM_RIGHT - HIT / 2 - LABEL_GAP - contentRight(screenW));
    update();
  }, [update]);

  // Re-measure the anchors on resize, and once fonts and images have loaded
  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, [measure]);

  // Follow the scroll, once per frame
  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame.current);
      window.clearTimeout(arrivalTimer.current);
    };
  }, [update]);

  // The rail mounts after the first measure: place the dot as soon as it exists
  useLayoutEffect(update, [update, railH, sections]);

  // Labels only show when the longest one fits between the content and the rail
  useLayoutEffect(() => {
    const measureLabels = () => {
      const spans = measureRef.current ? [...measureRef.current.children] : [];
      setLabelW(spans.length ? Math.max(...spans.map((el) => (el as HTMLElement).offsetWidth)) : Infinity);
    };
    measureLabels();
    document.fonts?.ready.then(measureLabels).catch(() => {});
  }, [sections, railH]);

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
        <nav aria-label="Page sections" className="hidden xl:block fixed z-30" style={{ top: TOP, right: LINE_FROM_RIGHT - HIT / 2, width: HIT, height: railH }}>
          {/* Ahead: dotted ink */}
          <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute left-[10px] top-0 h-full w-[4px] overflow-visible">
            <line x1="2" y1="0" x2="2" y2="100%" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0 9" className="text-ink/35" />
          </svg>
          {/* Behind: solid terracotta down to the dot (height set on scroll) */}
          <div ref={fillRef} aria-hidden="true" className="pointer-events-none absolute left-[10.5px] top-0 h-0 w-[3px] rounded-full bg-accent" />

          <ol className="m-0 list-none p-0">
            {sections.map((s, i) => (
              <li key={s.id} className="absolute left-0" style={{ top: pos(i) - HIT / 2, width: HIT, height: HIT }}>
                <button
                  type="button"
                  aria-label={`Go to: ${s.label}`}
                  aria-current={i === nearest ? 'true' : undefined}
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
                      i <= reached ? 'border-accent bg-accent' : 'border-ink/50 bg-paper'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ol>

          {/* The traveller (position set on scroll; clicks pass through to the circles) */}
          <div ref={dotRef} aria-hidden="true" className="pointer-events-none absolute left-[5px] top-0 -mt-[7px] h-[14px] w-[14px]">
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
