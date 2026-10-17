'use client';

import React from 'react';
import { motion } from 'motion/react';

// PM framework cards for the landing page, drawn in the illustration style (flat fills, 2px ink outlines,
// hard offset shadows). Each card takes `on` (start its little animation) and `delay` (seconds).
// Every animated element carries .m-final (or .m-final-path), which globals.css forces into its finished
// state when the visitor prefers reduced motion. All decorative: the parent SVG is aria-hidden.

const INK = '#1F2430';
const DISPLAY = { fontFamily: 'var(--font-display), Georgia, serif' };
const SANS = { fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' };
const EASE = [0.22, 1, 0.36, 1] as const;

export interface CardProps {
  on: boolean;
  delay: number;
}

const Frame: React.FC<{ w: number; h: number; title: string; titleSize?: number; children?: React.ReactNode }> = ({
  w,
  h,
  title,
  titleSize = 14,
  children,
}) => (
  <>
    <rect className="illo-shadow" x="4" y="4" width={w} height={h} rx="8" fill={INK} />
    <rect x="0" y="0" width={w} height={h} rx="8" fill="#FBF8F1" stroke={INK} strokeWidth="2" />
    <text x="12" y="22" style={DISPLAY} fontSize={titleSize} fontWeight="600" fill={INK}>
      {title}
    </text>
    {children}
  </>
);

// Pops an SVG group in from a smaller size
const Pop: React.FC<CardProps & { children: React.ReactNode; from?: number }> = ({ on, delay, children, from = 0.4 }) => (
  <motion.g
    className="m-final"
    initial={{ opacity: 0, scale: from }}
    animate={on ? { opacity: 1, scale: 1 } : undefined}
    transition={{ delay, duration: 0.4, ease: EASE }}
  >
    {children}
  </motion.g>
);

/* ---------- SWOT ---------- */

export const SWOT_SIZE = { w: 150, h: 128 };
const SWOT_CELLS = [
  { letter: 'S', x: 12, y: 32, fill: '#F3D9CC', text: INK },
  { letter: 'W', x: 78, y: 32, fill: '#EFE8D8', text: INK },
  { letter: 'O', x: 12, y: 78, fill: '#E8B04A', text: INK },
  { letter: 'T', x: 78, y: 78, fill: '#C2603A', text: '#F6F1E7' },
];

export const SwotCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...SWOT_SIZE} title="SWOT">
    {SWOT_CELLS.map((cell, i) => (
      <Pop key={cell.letter} on={on} delay={delay + i * 0.12}>
        <rect x={cell.x} y={cell.y} width="60" height="40" rx="5" fill={cell.fill} stroke={INK} strokeWidth="1.5" />
        <text x={cell.x + 30} y={cell.y + 27} textAnchor="middle" style={DISPLAY} fontSize="20" fontWeight="600" fill={cell.text}>
          {cell.letter}
        </text>
      </Pop>
    ))}
  </Frame>
);

/* ---------- AARRR ---------- */

export const AARRR_SIZE = { w: 176, h: 140 };
const AARRR_BARS = [
  { label: 'Acquisition', w: 152, fill: '#9E4524', text: '#F6F1E7' },
  { label: 'Activation', w: 128, fill: '#C2603A', text: '#F6F1E7' },
  { label: 'Retention', w: 106, fill: '#D98E6C', text: INK },
  { label: 'Referral', w: 86, fill: '#F3D9CC', text: INK },
  { label: 'Revenue', w: 66, fill: '#E8B04A', text: INK },
];

export const AarrrCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...AARRR_SIZE} title="AARRR">
    {AARRR_BARS.map((bar, i) => {
      const y = 34 + i * 20;
      return (
        <g key={bar.label}>
          <motion.rect
            className="m-final"
            x="12"
            y={y}
            width={bar.w}
            height="14"
            rx="3"
            fill={bar.fill}
            stroke={INK}
            strokeWidth="1.5"
            style={{ originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={on ? { scaleX: 1 } : undefined}
            transition={{ delay: delay + i * 0.1, duration: 0.55, ease: EASE }}
          />
          <motion.text
            className="m-final"
            x="18"
            y={y + 10.5}
            style={SANS}
            fontSize="8.5"
            fontWeight="600"
            fill={bar.text}
            initial={{ opacity: 0 }}
            animate={on ? { opacity: 1 } : undefined}
            transition={{ delay: delay + i * 0.1 + 0.35, duration: 0.3 }}
          >
            {bar.label}
          </motion.text>
        </g>
      );
    })}
  </Frame>
);

/* ---------- HEART ---------- */

export const HEART_SIZE = { w: 238, h: 100 };
const iconStroke = { fill: 'none', stroke: INK, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const HEART_TILES: { letter: string; fill: string; icon: React.ReactNode }[] = [
  {
    letter: 'H',
    fill: '#F3D9CC',
    icon: (
      <>
        <circle cx="19" cy="42" r="6.5" {...iconStroke} />
        <circle cx="16.8" cy="40.4" r="0.9" fill={INK} />
        <circle cx="21.2" cy="40.4" r="0.9" fill={INK} />
        <path d="M15.8 43.6 Q19 46.8 22.2 43.6" {...iconStroke} />
      </>
    ),
  },
  {
    letter: 'E',
    fill: '#EFE8D8',
    icon: <path d="M15.5 35.5 L15.5 48 L18.6 45 L20.8 49.6 L22.8 48.7 L20.6 44.2 L24.6 44 Z" fill="#FBF8F1" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />,
  },
  { letter: 'A', fill: '#F3D9CC', icon: <path d="M19 36 V48 M13 42 H25" {...iconStroke} strokeWidth="2" /> },
  {
    letter: 'R',
    fill: '#EFE8D8',
    icon: (
      <>
        <path d="M13.6 41.5 A5.6 5.6 0 0 1 23.6 38.6" {...iconStroke} />
        <path d="M23.9 35.4 L23.9 38.9 L20.4 38.9" {...iconStroke} />
        <path d="M24.4 42.5 A5.6 5.6 0 0 1 14.4 45.4" {...iconStroke} />
        <path d="M14.1 48.6 L14.1 45.1 L17.6 45.1" {...iconStroke} />
      </>
    ),
  },
  { letter: 'T', fill: '#F3D9CC', icon: <path d="M13.5 42.5 L17.5 46.5 L24.5 38" {...iconStroke} strokeWidth="2" /> },
];

export const HeartCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...HEART_SIZE} title="HEART">
    {HEART_TILES.map((tile, i) => (
      <g key={tile.letter} transform={`translate(${12 + i * 44} 32)`}>
        <Pop on={on} delay={delay + i * 0.1} from={0.6}>
          <rect x="0" y="0" width="38" height="56" rx="5" fill={tile.fill} stroke={INK} strokeWidth="1.5" />
          <text x="19" y="23" textAnchor="middle" style={DISPLAY} fontSize="16" fontWeight="600" fill={INK}>
            {tile.letter}
          </text>
          <g transform="translate(0 -6)">{tile.icon}</g>
        </Pop>
      </g>
    ))}
  </Frame>
);

/* ---------- 5Cs ---------- */

export const FIVE_CS_SIZE = { w: 172, h: 148 };
const C_CENTER = { x: 86, y: 70 };
const C_OUTER = [
  { x: 86, y: 40 },
  { x: 128, y: 70 },
  { x: 86, y: 100 },
  { x: 44, y: 70 },
];

export const FiveCsCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...FIVE_CS_SIZE} title="5Cs">
    {C_OUTER.map((c, i) => (
      <motion.line
        key={i}
        className="m-final-path"
        x1={C_CENTER.x}
        y1={C_CENTER.y}
        x2={c.x}
        y2={c.y}
        stroke={INK}
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={on ? { pathLength: 1 } : undefined}
        transition={{ delay: delay + 0.15 + i * 0.08, duration: 0.3 }}
      />
    ))}
    {[C_CENTER, ...C_OUTER].map((c, i) => (
      <Pop key={i} on={on} delay={delay + (i === 0 ? 0 : 0.3 + i * 0.08)}>
        <circle cx={c.x} cy={c.y} r="12" fill={i === 0 ? '#C2603A' : '#F3D9CC'} stroke={INK} strokeWidth="1.5" />
        <text x={c.x} y={c.y + 4.5} textAnchor="middle" style={DISPLAY} fontSize="13" fontWeight="600" fill={i === 0 ? '#F6F1E7' : INK}>
          C
        </text>
      </Pop>
    ))}
    <g style={SANS} fontSize="7.5" fill="#5E626C" textAnchor="middle">
      <text x="86" y="128">Company · Customers · Competitors</text>
      <text x="86" y="139">Collaborators · Context</text>
    </g>
  </Frame>
);

/* ---------- How PMs work (loop) ---------- */

export const LOOP_SIZE = { w: 180, h: 150 };
const LOOP = { cx: 90, cy: 90, r: 42 };
const rad = (deg: number) => (deg * Math.PI) / 180;
const onLoop = (deg: number) => ({ x: LOOP.cx + LOOP.r * Math.cos(rad(deg)), y: LOOP.cy + LOOP.r * Math.sin(rad(deg)) });
const r1 = (n: number) => Math.round(n * 10) / 10;

const LOOP_STOPS = [
  { label: 'Discover', deg: -90, dx: 0, dy: -9, anchor: 'middle' as const },
  { label: 'Define', deg: -18, dx: 8, dy: 3, anchor: 'start' as const },
  { label: 'Build', deg: 54, dx: 8, dy: 6, anchor: 'start' as const },
  { label: 'Measure', deg: 126, dx: -8, dy: 6, anchor: 'end' as const },
  { label: 'Learn', deg: 198, dx: -8, dy: 3, anchor: 'end' as const },
];

// Clockwise arcs between neighbouring stops, each with a small arrowhead at its end
const LOOP_ARCS = LOOP_STOPS.map((stop, i) => {
  const from = stop.deg + 14;
  const to = (i === LOOP_STOPS.length - 1 ? LOOP_STOPS[0].deg + 360 : LOOP_STOPS[i + 1].deg) - 14;
  const a = onLoop(from);
  const b = onLoop(to);
  const t = rad(to);
  const dir = { x: -Math.sin(t), y: Math.cos(t) };
  const nrm = { x: Math.cos(t), y: Math.sin(t) };
  const head = `M${r1(b.x - dir.x * 5 + nrm.x * 3.5)} ${r1(b.y - dir.y * 5 + nrm.y * 3.5)} L${r1(b.x)} ${r1(b.y)} L${r1(b.x - dir.x * 5 - nrm.x * 3.5)} ${r1(b.y - dir.y * 5 - nrm.y * 3.5)}`;
  return { arc: `M${r1(a.x)} ${r1(a.y)} A${LOOP.r} ${LOOP.r} 0 0 1 ${r1(b.x)} ${r1(b.y)}`, head };
});

export const LoopCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...LOOP_SIZE} title="How PMs work" titleSize={13}>
    {LOOP_ARCS.map((arc, i) => (
      <g key={i} fill="none" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          className="m-final-path"
          d={arc.arc}
          initial={{ pathLength: 0 }}
          animate={on ? { pathLength: 1 } : undefined}
          transition={{ delay: delay + i * 0.22, duration: 0.25, ease: 'linear' }}
        />
        <motion.path
          className="m-final"
          d={arc.head}
          initial={{ opacity: 0 }}
          animate={on ? { opacity: 1 } : undefined}
          transition={{ delay: delay + i * 0.22 + 0.22, duration: 0.1 }}
        />
      </g>
    ))}
    {LOOP_STOPS.map((stop) => {
      const p = onLoop(stop.deg);
      const learn = stop.label === 'Learn';
      return (
        <g key={stop.label}>
          <circle cx={r1(p.x)} cy={r1(p.y)} r={learn ? 5.5 : 4.5} fill={learn ? '#E8B04A' : '#FBF8F1'} stroke={INK} strokeWidth="1.5" />
          <text x={r1(p.x + stop.dx)} y={r1(p.y + stop.dy)} textAnchor={stop.anchor} style={SANS} fontSize="8.5" fontWeight="600" fill={INK}>
            {stop.label}
          </text>
        </g>
      );
    })}
  </Frame>
);

/* ---------- MVP checklist ---------- */

export const MVP_SIZE = { w: 150, h: 96 };
const MVP_ROWS = [
  { label: 'Core feature', done: true },
  { label: 'Feedback loop', done: true },
  { label: 'Polish', done: false },
];

export const MvpCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...MVP_SIZE} title="MVP v1" titleSize={13}>
    <rect x="102" y="9" width="36" height="17" rx="8.5" fill="#C2603A" stroke={INK} strokeWidth="1.5" />
    <text x="120" y="20.5" textAnchor="middle" style={SANS} fontSize="8.5" fontWeight="700" fill="#F6F1E7">
      Ship
    </text>
    {MVP_ROWS.map((row, i) => {
      const y = 36 + i * 19;
      return (
        <g key={row.label}>
          <rect x="12" y={y} width="12" height="12" rx="3" fill="#FBF8F1" stroke={row.done ? INK : '#8C8F98'} strokeWidth="1.5" />
          {row.done && (
            <>
              <motion.rect
                className="m-final"
                x="12"
                y={y}
                width="12"
                height="12"
                rx="3"
                fill="#C2603A"
                stroke={INK}
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={on ? { opacity: 1 } : undefined}
                transition={{ delay: delay + i * 0.35, duration: 0.15 }}
              />
              <motion.path
                className="m-final-path"
                d={`M15 ${y + 6.2} L17.4 ${y + 8.6} L21.2 ${y + 3.6}`}
                fill="none"
                stroke="#F6F1E7"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={on ? { pathLength: 1 } : undefined}
                transition={{ delay: delay + i * 0.35 + 0.1, duration: 0.25 }}
              />
            </>
          )}
          <text x="31" y={y + 9.5} style={SANS} fontSize="9" fontWeight={row.done ? 600 : 500} fill={row.done ? INK : '#8C8F98'}>
            {row.label}
          </text>
        </g>
      );
    })}
  </Frame>
);

/* ---------- Path section: product roadmap and user journey ---------- */

export const ROADMAP_SIZE = { w: 296, h: 178 };
const ROADMAP_COLUMNS = [
  { title: 'Now', cards: [{ bars: [44, 30], fill: '#F3D9CC' }, { bars: [36, 46], fill: '#E8B04A' }, { bars: [40], fill: '#F3D9CC' }] },
  { title: 'Next', cards: [{ bars: [46, 28], fill: '#EFE8D8' }, { bars: [34], fill: '#F3D9CC' }] },
  { title: 'Later', cards: [{ bars: [38, 44], fill: '#EFE8D8' }, { bars: [30, 22], fill: '#EFE8D8' }] },
];

export const RoadmapCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...ROADMAP_SIZE} title="Product roadmap">
    {ROADMAP_COLUMNS.map((column, c) => {
      const x = 12 + c * 92;
      return (
        <g key={column.title}>
          <rect x={x} y="32" width="84" height="134" rx="5" fill="#F6F1E7" stroke={INK} strokeWidth="1.25" />
          <text x={x + 8} y="46" style={SANS} fontSize="9" fontWeight="700" fill={INK}>
            {column.title}
          </text>
          {column.cards.map((card, i) => {
            const y = 54 + i * 36;
            return (
              <motion.g
                key={i}
                className="m-final"
                initial={{ opacity: 0, x: -14 }}
                animate={on ? { opacity: 1, x: 0 } : undefined}
                transition={{ delay: delay + c * 0.18 + i * 0.12, duration: 0.45, ease: EASE }}
              >
                <rect x={x + 6} y={y} width="72" height="28" rx="4" fill={card.fill} stroke={INK} strokeWidth="1.25" />
                {card.bars.map((w, b) => (
                  <rect key={b} x={x + 12} y={y + 7 + b * 9} width={w} height="4" rx="2" fill="#9E4524" opacity={b === 0 ? 0.85 : 0.45} />
                ))}
              </motion.g>
            );
          })}
        </g>
      );
    })}
  </Frame>
);

export const JOURNEY_SIZE = { w: 296, h: 150 };
// Emotion curve: steady at Discover, up at Sign up, dips at Learn, rises at Return
const JOURNEY_STOPS = [
  { label: 'Discover', x: 42, y: 78 },
  { label: 'Sign up', x: 112, y: 62 },
  { label: 'Learn', x: 184, y: 98 },
  { label: 'Return', x: 254, y: 52 },
];
const JOURNEY_CURVE = 'M22 84 C 34 80, 38 78, 42 78 C 70 77, 90 62, 112 62 C 140 62, 156 98, 184 98 C 210 98, 230 54, 254 52 C 264 51, 270 52, 276 50';

export const JourneyCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...JOURNEY_SIZE} title="User journey">
    <line x1="18" y1="120" x2="280" y2="120" stroke={INK} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
    <motion.path
      className="m-final-path"
      d={JOURNEY_CURVE}
      fill="none"
      stroke="#C2603A"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={on ? { pathLength: 1 } : undefined}
      transition={{ delay, duration: 1.1, ease: 'easeInOut' }}
    />
    {JOURNEY_STOPS.map((stop, i) => (
      <g key={stop.label}>
        <Pop on={on} delay={delay + 0.2 + i * 0.25}>
          <circle cx={stop.x} cy={stop.y} r="5.5" fill={i === 3 ? '#E8B04A' : '#FBF8F1'} stroke={INK} strokeWidth="1.5" />
        </Pop>
        <text x={stop.x} y="136" textAnchor="middle" style={SANS} fontSize="9" fontWeight="600" fill={INK}>
          {stop.label}
        </text>
      </g>
    ))}
  </Frame>
);
