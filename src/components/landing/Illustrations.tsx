import React from 'react';

// Small landing-page illustrations in the hero scene's style: flat palette shapes, ink outlines and a
// hard offset shadow (an ink copy of the silhouette, shifted right and down). All decorative (aria-hidden).
// Ink (#1F2430) swaps to a darker ink in dark mode through the .illo rules in globals.css.

const INK = '#1F2430';

// Draws its children twice: once as a solid ink shadow shifted by `offset`, then as themselves on top
const Shadowed: React.FC<{ offset?: number; children: React.ReactNode }> = ({ offset = 4, children }) => (
  <>
    <g className="illo-shadow" transform={`translate(${offset} ${offset})`}>
      {React.Children.map(children, (child) =>
        React.isValidElement<React.SVGProps<SVGElement>>(child)
          ? React.cloneElement(child, { fill: child.props.fill === 'none' ? 'none' : INK, stroke: INK })
          : child
      )}
    </g>
    {children}
  </>
);

const Illo: React.FC<{ viewBox: string; className?: string; children: React.ReactNode }> = ({
  viewBox,
  className = '',
  children,
}) => (
  <svg viewBox={viewBox} aria-hidden="true" focusable="false" className={`illo pointer-events-none ${className}`}>
    {children}
  </svg>
);

const outline = { stroke: INK, strokeWidth: 2, strokeLinejoin: 'round' as const };

/* ---------- Your 5-week path ---------- */

export const Compass: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 104 112" className={className}>
    <g transform="rotate(-8 52 58)">
      <Shadowed>
        <circle cx="50" cy="12" r="6" fill="#E8B04A" {...outline} />
        <circle cx="50" cy="58" r="40" fill="#FBF8F1" {...outline} />
      </Shadowed>
      <circle cx="50" cy="58" r="31" fill="#F3D9CC" stroke={INK} strokeWidth="1.5" />
      {/* N, E, S, W ticks */}
      <g stroke={INK} strokeWidth="2" strokeLinecap="round">
        <line x1="50" y1="21" x2="50" y2="25" />
        <line x1="87" y1="58" x2="83" y2="58" />
        <line x1="50" y1="95" x2="50" y2="91" />
        <line x1="13" y1="58" x2="17" y2="58" />
      </g>
      {/* Needle: terracotta points north */}
      <path d="M50 32 L58 58 L42 58 Z" fill="#C2603A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M50 84 L58 58 L42 58 Z" fill="#FBF8F1" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="50" cy="58" r="4" fill="#E8B04A" stroke={INK} strokeWidth="1.5" />
    </g>
  </Illo>
);

export const MiniFlag: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 40 48" className={className}>
    <g transform="rotate(4 10 44)">
      <Shadowed offset={3}>
        <path d="M9 5 L35 13 L9 21 Z" fill="#E8B04A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      </Shadowed>
      <line className="illo-line" x1="9" y1="45" x2="9" y2="4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </Illo>
);

/* ---------- A day on ProdPath ---------- */

export const CoffeeMug: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 112 120" className={className}>
    {/* Steam */}
    <g fill="none" stroke="#D98E6C" strokeWidth="2.5" strokeLinecap="round">
      <path d="M40 30 C 34 22, 46 18, 40 8" />
      <path d="M56 32 C 50 24, 62 20, 56 10" />
    </g>
    <g transform="rotate(6 52 80)">
      <Shadowed>
        <path d="M74 56 h4 a15 15 0 0 1 0 30 h-4" fill="none" stroke={INK} strokeWidth="10" />
        <rect x="20" y="42" width="56" height="62" rx="9" fill="#C2603A" {...outline} />
      </Shadowed>
      {/* Handle: an ink ring with a terracotta core */}
      <path d="M74 56 h4 a15 15 0 0 1 0 30 h-4" fill="none" stroke="#C2603A" strokeWidth="5.5" />
      <rect x="20" y="42" width="56" height="62" rx="9" fill="#C2603A" {...outline} />
      <rect x="20" y="58" width="56" height="14" fill="#F3D9CC" stroke={INK} strokeWidth="1.5" />
      <circle cx="48" cy="88" r="5" fill="#E8B04A" stroke={INK} strokeWidth="1.5" />
    </g>
  </Illo>
);

export const NoteCard: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 112 112" className={className}>
    <g transform="rotate(-6 52 56)">
      <Shadowed>
        <rect x="12" y="16" width="84" height="84" rx="4" fill="#F3D9CC" {...outline} />
      </Shadowed>
      <g fill="#9E4524">
        <rect x="26" y="36" width="52" height="5" rx="2.5" />
        <rect x="26" y="50" width="40" height="5" rx="2.5" />
        <rect x="26" y="64" width="46" height="5" rx="2.5" />
      </g>
      <path d="M27 83 L33 89 L45 76" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Tape */}
      <rect x="38" y="8" width="32" height="14" rx="2" fill="#FBF8F1" stroke={INK} strokeWidth="1.5" transform="rotate(4 54 15)" />
    </g>
  </Illo>
);

/* ---------- Everything in one place ---------- */

export const Rocket: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 104 124" className={className}>
    <g transform="rotate(8 52 62)">
      <Shadowed>
        <path d="M34 60 L18 80 L20 92 L36 80 Z" fill="#C2603A" {...outline} />
        <path d="M70 60 L86 80 L84 92 L68 80 Z" fill="#C2603A" {...outline} />
        <path d="M52 8 C 70 24, 74 50, 70 82 L34 82 C 30 50, 34 24, 52 8 Z" fill="#FBF8F1" {...outline} />
      </Shadowed>
      <path d="M43 82 C 44 96, 52 110, 52 110 C 52 110, 60 96, 61 82 Z" fill="#E8B04A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="40" y="80" width="24" height="8" rx="2" fill={INK} />
      <circle cx="52" cy="44" r="10" fill="#F3D9CC" stroke={INK} strokeWidth="2" />
      <line x1="40" y1="64" x2="64" y2="64" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </Illo>
);

// 48px icon tiles for the four feature blocks
const ICON_VIEWBOX = '0 0 50 50';
const iconOutline = { stroke: INK, strokeWidth: 1.75, strokeLinejoin: 'round' as const };

export const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox={ICON_VIEWBOX} className={className}>
    <Shadowed offset={3}>
      <path d="M24 14 C 18 10, 10 10, 4 12 L4 37 C 10 35, 18 35, 24 39 Z" fill="#FBF8F1" {...iconOutline} />
      <path d="M24 14 C 30 10, 38 10, 44 12 L44 37 C 38 35, 30 35, 24 39 Z" fill="#F3D9CC" {...iconOutline} />
    </Shadowed>
    <g stroke="#C2603A" strokeWidth="1.75" strokeLinecap="round">
      <line x1="9" y1="19" x2="19" y2="18" />
      <line x1="9" y1="25" x2="19" y2="24" />
      <line x1="9" y1="31" x2="16" y2="30.5" />
    </g>
    <path d="M33 12 L33 24 L36.5 21 L40 24 L40 11.4" fill="#E8B04A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
  </Illo>
);

export const SearchDocIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox={ICON_VIEWBOX} className={className}>
    <Shadowed offset={3}>
      <rect x="6" y="5" width="27" height="35" rx="3" fill="#FBF8F1" {...iconOutline} />
    </Shadowed>
    <g fill="#C2603A">
      <rect x="11" y="11" width="16" height="3" rx="1.5" />
      <rect x="11" y="17" width="12" height="3" rx="1.5" />
      <rect x="11" y="23" width="9" height="3" rx="1.5" />
    </g>
    <line x1="36" y1="36" x2="43" y2="43" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
    <Shadowed offset={2}>
      <circle cx="31" cy="31" r="8.5" fill="#E8B04A" {...iconOutline} />
    </Shadowed>
    <circle cx="31" cy="31" r="4.5" fill="#FBF8F1" stroke={INK} strokeWidth="1.25" />
  </Illo>
);

export const PlayScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox={ICON_VIEWBOX} className={className}>
    <Shadowed offset={3}>
      <rect x="18" y="35" width="12" height="7" rx="1.5" fill="#F3D9CC" {...iconOutline} />
      <rect x="4" y="8" width="40" height="28" rx="4" fill="#FBF8F1" {...iconOutline} />
    </Shadowed>
    <path d="M20 15 L31 22 L20 29 Z" fill="#C2603A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="38" cy="13" r="2" fill="#E8B04A" />
  </Illo>
);

const HEAT = ['#EFE8D8', '#D98E6C', '#9E4524', '#F3D9CC', '#C2603A', '#D98E6C', '#C2603A', '#F3D9CC', '#9E4524'];

export const HeatGridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox={ICON_VIEWBOX} className={className}>
    <Shadowed offset={3}>
      <rect x="5" y="6" width="38" height="36" rx="4" fill="#FBF8F1" {...iconOutline} />
    </Shadowed>
    {HEAT.map((fill, i) => (
      <rect
        key={i}
        x={10 + (i % 3) * 10}
        y={11 + Math.floor(i / 3) * 9.5}
        width="8"
        height="7.5"
        rx="1.5"
        fill={fill}
        stroke={INK}
        strokeWidth="1"
      />
    ))}
  </Illo>
);

/* ---------- Signed-in pages ---------- */

// Current-streak tile
export const Flame: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 40 48" className={className}>
    <g transform="rotate(-6 20 26)">
      <Shadowed offset={3}>
        <path d="M20 4 C 26 13, 34 18, 34 30 C 34 39, 28 44, 20 44 C 12 44, 6 39, 6 30 C 6 22, 12 18, 13 11 C 17 15, 18 18, 18 21 C 21 16, 21 10, 20 4 Z" fill="#E8B04A" {...iconOutline} />
      </Shadowed>
      <path d="M20 24 C 24 29, 27 32, 27 36 C 27 40, 24 42, 20 42 C 16 42, 13 40, 13 36 C 13 32, 17 30, 20 24 Z" fill="#C2603A" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  </Illo>
);

// Empty state on the Activity page: a flag waiting on a bare little hill
export const EmptyFlag: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 120 100" className={className}>
    <Shadowed>
      <path d="M8 92 C 26 66, 46 56, 62 56 C 80 56, 98 68, 112 92 Z" fill="#F3D9CC" {...outline} />
    </Shadowed>
    <g transform="rotate(4 60 56)">
      <Shadowed offset={3}>
        <path d="M61 14 L88 22 L61 30 Z" fill="#FBF8F1" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </Shadowed>
      <line className="illo-line" x1="61" y1="57" x2="61" y2="12" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <path className="illo-line" d="M30 92 C 38 84, 44 80, 52 74" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.1 7" />
  </Illo>
);

// Dashboard: the hero's sticky note with a check mark
export const StickyCheck: React.FC<{ className?: string }> = ({ className }) => (
  <Illo viewBox="0 0 112 112" className={className}>
    <g transform="rotate(6 52 52)">
      <Shadowed>
        <rect x="6" y="6" width="96" height="96" rx="4" fill="#E8B04A" {...outline} />
      </Shadowed>
      <g fill="#9E4524">
        <rect x="20" y="26" width="60" height="5" rx="2.5" />
        <rect x="20" y="40" width="46" height="5" rx="2.5" />
        <rect x="20" y="54" width="54" height="5" rx="2.5" />
      </g>
      <path d="M22 78 L29 85 L42 70" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </Illo>
);

// Small marks beside each week's title on the course page, keyed by the week's position (0-4)
const WEEK_MARKS: React.ReactNode[] = [
  // Week 1: seedling in a pot
  <g key="seedling">
    <path d="M24 30 C 24 22, 24 18, 24 14" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    <path d="M24 20 C 16 20, 10 15, 10 8 C 18 8, 24 12, 24 20 Z" fill="#F3D9CC" {...iconOutline} />
    <path d="M24 17 C 30 17, 37 13, 38 6 C 30 6, 24 10, 24 17 Z" fill="#E8B04A" {...iconOutline} />
    <Shadowed offset={3}>
      <path d="M13 29 L35 29 L32 43 L16 43 Z" fill="#C2603A" {...iconOutline} />
    </Shadowed>
  </g>,
  // Week 2: bar chart
  <g key="chart">
    <Shadowed offset={3}>
      <rect x="5" y="6" width="38" height="36" rx="4" fill="#FBF8F1" {...iconOutline} />
    </Shadowed>
    <rect x="11" y="27" width="6" height="9" rx="1.5" fill="#EBC3AE" stroke={INK} strokeWidth="1.25" />
    <rect x="21" y="20" width="6" height="16" rx="1.5" fill="#C2603A" stroke={INK} strokeWidth="1.25" />
    <rect x="31" y="13" width="6" height="23" rx="1.5" fill="#9E4524" stroke={INK} strokeWidth="1.25" />
  </g>,
  // Week 3: gear
  <g key="gear">
    <Shadowed offset={3}>
      <path
        d="M21 4 L27 4 L28 10 L32 12 L37 8 L41 12 L37 17 L39 21 L45 22 L45 28 L39 29 L37 33 L41 38 L37 42 L32 38 L28 40 L27 46 L21 46 L20 40 L16 38 L11 42 L7 38 L11 33 L9 29 L3 28 L3 22 L9 21 L11 17 L7 12 L11 8 L16 12 L20 10 Z"
        fill="#E8B04A"
        {...iconOutline}
      />
    </Shadowed>
    <circle cx="24" cy="25" r="7" fill="#FBF8F1" stroke={INK} strokeWidth="1.75" />
  </g>,
  // Week 4: speech bubble
  <g key="bubble">
    <Shadowed offset={3}>
      <path d="M6 8 L42 8 Q 44 8, 44 10 L44 32 Q 44 34, 42 34 L20 34 L11 42 L12 34 L8 34 Q 6 34, 6 32 L6 10 Q 6 8, 8 8 Z" fill="#F3D9CC" {...iconOutline} />
    </Shadowed>
    <circle cx="16" cy="21" r="2.5" fill="#9E4524" />
    <circle cx="25" cy="21" r="2.5" fill="#9E4524" />
    <circle cx="34" cy="21" r="2.5" fill="#9E4524" />
  </g>,
  // Week 5: sparkle
  <g key="sparkle">
    <Shadowed offset={3}>
      <path d="M24 3 L29 19 L45 24 L29 29 L24 45 L19 29 L3 24 L19 19 Z" fill="#E8B04A" {...iconOutline} />
    </Shadowed>
    <path d="M40 4 L41.5 8.5 L46 10 L41.5 11.5 L40 16 L38.5 11.5 L34 10 L38.5 8.5 Z" fill="#FBF8F1" stroke={INK} strokeWidth="1.25" strokeLinejoin="round" />
  </g>,
];

export const WeekMark: React.FC<{ index: number; className?: string }> = ({ index, className }) => {
  const mark = WEEK_MARKS[index];
  if (!mark) return null;
  return (
    <Illo viewBox={ICON_VIEWBOX} className={className}>
      {mark}
    </Illo>
  );
};
