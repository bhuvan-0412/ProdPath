'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Faint, hand-placed PM icons behind page content (decorative: aria-hidden, ignores the pointer).
//
// Each page passes a hand-placed list of candidate spots (percent of the decor layer) with a fixed size,
// tilt and fill. After layout, every candidate is checked against the content actually on screen: an icon is
// only shown if it keeps a clear margin from every piece of text, card, button, input or illustration, stays
// inside the screen, and isn't crowding another icon. So icons fill gaps and margins at any width, and simply
// drop out where there is no room (most do on phones). The check re-runs when the page changes size.

export type IconKind =
  | 'lightbulb' | 'target' | 'flag' | 'barChart' | 'lineChart' | 'pieChart' | 'note' | 'cursor'
  | 'search' | 'puzzle' | 'chat' | 'rocket' | 'compass' | 'calendar' | 'kanban' | 'phone'
  | 'user' | 'gear' | 'checklist' | 'funnel' | 'trophy' | 'pin' | 'pencil' | 'plane';

// 24 x 24 outline drawings
export const ICONS: Record<IconKind, React.ReactNode> = {
  lightbulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h12l-2.5 4L17 12H5z" />,
  barChart: <path d="M6 12h3v5H6zM10.5 8h3v9h-3zM15 10h3v7h-3zM4 20h16" />,
  lineChart: <path d="M4 4v16h16M7 15l4-4 3 3 5-6" />,
  pieChart: <path d="M11 4a8 8 0 1 0 8 8h-8zM14 2.6v7.4h7.4A7.4 7.4 0 0 0 14 2.6z" />,
  note: <path d="M5 4h14v10l-5 5H5zM14 19v-5h5" />,
  cursor: <path d="M5 3l6.5 16 2.3-6.7L20.5 10z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  puzzle: <path d="M5 5h4.5a2.2 2.2 0 1 1 4 0H18v4.5a2.2 2.2 0 1 1 0 4V18h-4.5a2.2 2.2 0 1 0-4 0H5v-4.5a2.2 2.2 0 1 0 0-4z" />,
  chat: <path d="M4 5h16v11h-9l-5 4v-4H4z" />,
  rocket: (
    <>
      <path d="M12 2.5c3.2 2.6 4.6 6.4 4 11.5H8c-.6-5.1.8-8.9 4-11.5zM8 14l-3 3.2.8 2.3L9 17.4M16 14l3 3.2-.8 2.3-3.2-2.1M10 18h4l-2 3.5z" />
      <circle cx="12" cy="9" r="1.7" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z" />
    </>
  ),
  calendar: <path d="M4 6h16v14H4zM4 10.5h16M8.5 3v4.5M15.5 3v4.5M8 14h2M11 14h2M14 14h2M8 17h2" />,
  kanban: <path d="M3 5h18v15H3zM9 5v15M15 5v15M4.8 8.5h2.6M10.7 8.5h2.6M16.6 8.5h2.6M4.8 11.5h2.6M10.7 11.5h2.6" />,
  phone: <path d="M7 2.5h10v19H7zM10.5 4.8h3M9 7.5h6v5H9zM9 14.5h6M9 17h4" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  checklist: <path d="M4 5h2.5v2.5H4zM4 11h2.5v2.5H4zM4 17h2.5v2.5H4zM9.5 6.2H20M9.5 12.2H20M9.5 18.2H16" />,
  funnel: <path d="M3 4h18l-7 8.2V18l-4 2.2v-8z" />,
  trophy: <path d="M7 3.5h10V9a5 5 0 0 1-10 0zM7 5.5H4c0 3 1.5 4.6 3.2 4.8M17 5.5h3c0 3-1.5 4.6-3.2 4.8M12 14v3.5M8.5 21h7M9.5 17.5h5" />,
  pin: (
    <>
      <path d="M12 21.5s-6.5-6.3-6.5-11.2a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11.2-6.5 11.2z" />
      <circle cx="12" cy="10.2" r="2.3" />
    </>
  ),
  pencil: <path d="M4 20l1-4.6L15.6 4.8l3.6 3.6L8.6 19zM13.6 6.8l3.6 3.6" />,
  plane: <path d="M3 11L21 3l-6 18-4-7zM11 14L21 3" />,
};

export interface BgIcon {
  k: IconKind;
  /** Centre, in percent of the decor layer (x across the screen, y down the section or page) */
  x: number;
  y: number;
  /** Size in px (20 to 56) and tilt in degrees */
  s: number;
  r: number;
  /** Soft color inside the outline */
  f?: 'soft' | 'gold';
  /** Only from this screen width up; leave out for icons that may also show on phones */
  from?: 'md' | 'lg';
}

// Lets the landing page wrap each icon (for scroll parallax) without this file depending on Motion
export const IconWrapperContext = createContext<React.FC<{ index: number; style: React.CSSProperties; children: React.ReactNode }> | null>(null);

const MIN_WIDTH = { md: 768, lg: 1024 };
const REPLACED = new Set(['svg', 'img', 'input', 'textarea', 'select', 'button', 'video', 'canvas', 'iframe', 'picture']);

type Box = { l: number; t: number; r: number; b: number };

// A box, border, shadow or replaced element (text is handled separately, by its glyph boxes)
const hasPaint = (el: Element, cs: CSSStyleDeclaration) => {
  if (REPLACED.has(el.tagName.toLowerCase())) return true;
  const bg = cs.backgroundColor;
  if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return true;
  if (cs.backgroundImage !== 'none') return true;
  if (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth) > 0) return true;
  return cs.boxShadow !== 'none';
};

// Everything inside `scope` that actually draws something on screen, except decoration layers
const collectObstacles = (scope: Element, layer: Element): Box[] => {
  const boxes: Box[] = [];
  const walk = (el: Element) => {
    for (const child of el.children) {
      if (child === layer) continue;
      if (child.hasAttribute('data-decor') && !child.hasAttribute('data-obstacle')) continue;
      const cs = getComputedStyle(child);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = child.getBoundingClientRect();
      if (hasPaint(child, cs) && rect.width > 0 && rect.height > 0 && cs.opacity !== '0') {
        boxes.push({ l: rect.left, t: rect.top, r: rect.right, b: rect.bottom });
        if (child.tagName.toLowerCase() === 'svg') continue; // its drawing is inside its box
      }
      // Text: one box per line of actual glyphs
      for (const node of child.childNodes) {
        if (node.nodeType !== 3 || !node.textContent || !node.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const line of range.getClientRects()) {
          if (line.width > 0 && line.height > 0) boxes.push({ l: line.left, t: line.top, r: line.right, b: line.bottom });
        }
      }
      walk(child);
    }
  };
  walk(scope);
  return boxes;
};

interface BackgroundIconsProps {
  icons: BgIcon[];
  /** Positioning of the decor layer inside its parent */
  className?: string;
  /** Minimum gap between an icon and any content, in px */
  clearance?: number;
  /** Extra gap for icons that move (parallax), in px */
  travel?: number;
  /** Keep this many px free along the screen's right / left edge (e.g. for the landing scroll trail) */
  reserveRight?: number;
  reserveLeft?: number;
  /** Slow drift (landing page only) */
  animated?: boolean;
  /** Outline strength (0-1); fills are a little stronger */
  strength?: number;
}

export const BackgroundIcons: React.FC<BackgroundIconsProps> = ({
  icons,
  className = 'absolute inset-0',
  clearance = 20,
  travel = 0,
  reserveRight = 0,
  reserveLeft = 0,
  animated = false,
  strength = 0.17,
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean[] | null>(null);
  const Wrapper = useContext(IconWrapperContext);

  const place = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const scope = layer.closest('[data-icon-scope]') || layer.parentElement;
    if (!scope) return;
    const area = layer.getBoundingClientRect();
    const screenW = document.documentElement.clientWidth;
    const obstacles = collectObstacles(scope, layer);
    // A little tighter on small screens, where the only gaps are small
    const small = screenW < 1024;
    // Moving icons need extra room: parallax travel (half of it counts on small screens) and the slow drift
    const pad = (screenW < 640 ? Math.min(clearance, 10) : small ? Math.min(clearance, 16) : clearance) + (small ? travel / 2 : travel) + (animated ? 8 : 0);
    const reserveR = small ? Math.min(reserveRight, 8) : reserveRight;
    const accepted: { x: number; y: number; s: number }[] = [];

    const result = icons.map((icon) => {
      if (icon.from && screenW < MIN_WIDTH[icon.from]) return false;
      const size = icon.s * 1.12; // room for the tilt
      const cx = area.left + (icon.x / 100) * area.width;
      const cy = area.top + (icon.y / 100) * area.height;
      const box = { l: cx - size / 2, t: cy - size / 2, r: cx + size / 2, b: cy + size / 2 };
      if (box.l < 6 + reserveLeft || box.r > screenW - 6 - reserveR) return false;
      // Clear of the section's own edges too (the next band may be a different color)
      if (box.t < area.top + pad || box.b > area.bottom - pad) return false;
      const near = obstacles.some((o) => box.l < o.r + pad && box.r > o.l - pad && box.t < o.b + pad && box.b > o.t - pad);
      if (near) return false;
      // No clusters: keep a gap between neighbouring icons
      const crowded = accepted.some((a) => Math.hypot(a.x - cx, a.y - cy) < (a.s + icon.s) / 2 + 28);
      if (crowded) return false;
      accepted.push({ x: cx, y: cy, s: icon.s });
      return true;
    });
    setShown(result);
  }, [icons, clearance, travel, reserveRight, reserveLeft, animated]);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(place, 120);
    };
    schedule();
    // Again once entrance animations and web fonts have settled
    const late = window.setTimeout(place, 900);
    document.fonts?.ready.then(schedule).catch(() => {});
    const layer = layerRef.current;
    const scope = layer?.closest('[data-icon-scope]') || layer?.parentElement;
    const observer = new ResizeObserver(schedule);
    if (scope) observer.observe(scope);
    window.addEventListener('resize', schedule);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(late);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [place]);

  return (
    <div ref={layerRef} aria-hidden="true" data-decor="" className={`pointer-events-none ${className}`}>
      {shown &&
        icons.map((icon, i) => {
          if (!shown[i]) return null;
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            width: icon.s,
            height: icon.s,
            marginLeft: -icon.s / 2,
            marginTop: -icon.s / 2,
          };
          const svg = (
            <svg
              viewBox="0 0 24 24"
              width={icon.s}
              height={icon.s}
              focusable="false"
              data-bg-icon={icon.k}
              className={`block text-ink ${animated ? 'icon-drift' : ''}`}
              style={
                {
                  rotate: `${icon.r}deg`,
                  '--dur': `${16 + (i % 5) * 2.5}s`,
                  '--delay': `${-i * 1.9}s`,
                  '--dx': `${i % 2 ? 6 : -5}px`,
                  '--dy': `${i % 3 ? -7 : 6}px`,
                  '--dr': `${i % 2 ? 4 : -3}deg`,
                } as React.CSSProperties
              }
            >
              <g
                className={icon.f === 'soft' ? 'bgi-soft' : icon.f === 'gold' ? 'bgi-gold' : undefined}
                fill={icon.f ? undefined : 'none'}
                stroke="currentColor"
                strokeOpacity={strength}
                strokeWidth={icon.s >= 40 ? 1.5 : 1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[icon.k]}
              </g>
            </svg>
          );
          return Wrapper ? (
            <Wrapper key={i} index={i} style={style}>
              {svg}
            </Wrapper>
          ) : (
            <div key={i} style={style}>
              {svg}
            </div>
          );
        })}
    </div>
  );
};

// Background icons for a whole page: a layer as wide as the screen and as tall as the page content.
// Place it next to PageBackdrop, outside the page's animate-fade-in wrapper. reserveLeft keeps the icons
// clear of PageBackdrop's short trail on the left edge.
export const PageIcons: React.FC<{ icons: BgIcon[]; reserveLeft?: number }> = ({ icons, reserveLeft = 36 }) => (
  <BackgroundIcons icons={icons} reserveLeft={reserveLeft} className="absolute inset-y-0 left-[calc(50%-50vw)] w-screen -z-10" />
);
