'use client';

import React from 'react';
import { motion } from 'motion/react';
import './reducedMotion';

// PM framework cards for the landing page, drawn in the illustration style (flat fills, 2px ink outlines,
// hard offset shadows). Each card takes `on` (start its little animation) and `delay` (seconds).
// Every animated element carries .m-final (or .m-final-path), which globals.css forces into its finished
// state when the visitor prefers reduced motion. All decorative: the parent SVG is aria-hidden.
// No names, numbers or figures anywhere: these are generic sketches of the frameworks.

const INK = '#1F2430';
const DISPLAY = { fontFamily: 'var(--font-display), Georgia, serif' };
const SANS = { fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' };
const EASE = [0.22, 1, 0.36, 1] as const;

export interface CardProps {
  on: boolean;
  delay: number;
}

const Frame: React.FC<{ w: number; h: number; title: string; step?: string; titleSize?: number; stepSize?: number; children?: React.ReactNode }> = ({
  w,
  h,
  title,
  step,
  titleSize = 14,
  stepSize = 8,
  children,
}) => {
  const [num, ...words] = (step || '').split(' ');
  return (
    <>
      <rect className="illo-shadow" x="4" y="4" width={w} height={h} rx="8" fill={INK} />
      <rect x="0" y="0" width={w} height={h} rx="8" fill="#FBF8F1" stroke={INK} strokeWidth="2" />
      <text x="12" y="22" style={DISPLAY} fontSize={titleSize} fontWeight="600" fill={INK}>
        {title}
      </text>
      {/* Lifecycle step, e.g. "1 Discover" */}
      {step && (
        <text x={w - 10} y={stepSize > 8 ? 24 : 20} textAnchor="end" style={SANS} fontSize={stepSize} fontWeight="600" fill="#9E4524">
          <tspan fontWeight="800">{num}</tspan> {words.join(' ')}
        </text>
      )}
      {children}
    </>
  );
};

// Pops an SVG group in from a smaller size
const Pop: React.FC<CardProps & { children: React.ReactNode; from?: number }> = ({ on, delay, children, from = 0.4 }) => (
  <motion.g
    className="m-final"
    initial={{ opacity: 0, scale: from }}
    animate={on ? { opacity: 1, scale: 1 } : undefined}
    transition={{ delay, duration: 0.35, ease: EASE }}
  >
    {children}
  </motion.g>
);

// Draws a line in
const Draw: React.FC<CardProps & { duration?: number } & React.SVGProps<SVGPathElement>> = ({ on, delay, duration = 0.3, ...path }) => (
  <motion.path
    className="m-final-path"
    initial={{ pathLength: 0 }}
    animate={on ? { pathLength: 1 } : undefined}
    transition={{ delay, duration, ease: 'easeOut' }}
    {...(path as object)}
  />
);

const Tag: React.FC<{ x: number; y: number; w: number; label: string; tone: 'goal' | 'pain' }> = ({ x, y, w, label, tone }) => (
  <g>
    <rect x={x} y={y} width={w} height="15" rx="7.5" fill={tone === 'goal' ? '#F3D9CC' : '#C2603A'} stroke={INK} strokeWidth="1.25" />
    <text x={x + w / 2} y={y + 10.5} textAnchor="middle" style={SANS} fontSize="8" fontWeight="600" fill={tone === 'goal' ? INK : '#F6F1E7'}>
      {label}
    </text>
  </g>
);

/* ---------- 1 Discover: user persona ---------- */

export const PERSONA_SIZE = { w: 176, h: 100 };

export const PersonaCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...PERSONA_SIZE} title="Persona" step="1 Discover">
    {/* Silhouette avatar: no name, no age */}
    <circle cx="36" cy="62" r="20" fill="#F3D9CC" stroke={INK} strokeWidth="1.5" />
    <circle cx="36" cy="56" r="6.5" fill={INK} />
    <path d="M24 77 C 24 66, 48 66, 48 77" fill={INK} />
    {[
      { y: 34, w: 64, label: 'Learn fast', tone: 'goal' as const },
      { y: 54, w: 68, label: 'Land a role', tone: 'goal' as const },
      { y: 74, w: 52, label: 'No time', tone: 'pain' as const },
    ].map((tag, i) => (
      <Pop key={tag.label} on={on} delay={delay + i * 0.12} from={0.6}>
        <Tag x={68} {...tag} />
      </Pop>
    ))}
  </Frame>
);

/* ---------- 3 Strategy: North Star metric ---------- */

// Small arrowhead at (x2, y2), pointing along the line from (x1, y1)
const arrowHead = (x1: number, y1: number, x2: number, y2: number, size = 4) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const wing = (turn: number) => `${(x2 - size * Math.cos(a + turn)).toFixed(1)} ${(y2 - size * Math.sin(a + turn)).toFixed(1)}`;
  return `M${wing(0.55)} L${x2} ${y2} L${wing(-0.55)}`;
};

const starPath = (cx: number, cy: number, outer: number, inner: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ') + ' Z';

export const NORTH_STAR_SIZE = { w: 156, h: 124 };
// Three input metrics (blank bars, no figures), each pushing up into the one key metric
const NS_INPUTS = [
  { x: 34, fill: '#F3D9CC', to: [64, 73] },
  { x: 78, fill: '#C2603A', to: [78, 71] },
  { x: 122, fill: '#E8B04A', to: [92, 73] },
];

export const NorthStarCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...NORTH_STAR_SIZE} title="North Star" step="3 Strategy">
    {/* A soft glow that blooms once behind the star (it ends invisible, so reduced motion simply skips it) */}
    <motion.circle
      cx="78"
      cy="55"
      r="24"
      fill="#E8B04A"
      fillOpacity="0.4"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={on ? { opacity: [0, 1, 0], scale: [0.6, 1.2, 1.35] } : undefined}
      transition={{ delay: delay + 0.75, duration: 0.9, ease: 'easeOut' }}
    />
    <motion.g className="m-final" animate={on ? { scale: [1, 1.16, 1] } : undefined} transition={{ delay: delay + 0.75, duration: 0.6, ease: 'easeInOut' }}>
      <path d={starPath(78, 55, 19, 8)} fill="#E8B04A" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </motion.g>
    {NS_INPUTS.map((input, i) => (
      <g key={input.x}>
        <g fill="none" stroke={INK} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <Draw on={on} delay={delay + i * 0.12} d={`M${input.x} 89 L${input.to[0]} ${input.to[1]}`} />
          <Draw on={on} delay={delay + i * 0.12 + 0.25} d={arrowHead(input.x, 89, input.to[0], input.to[1])} />
        </g>
        <rect x={input.x - 18} y="92" width="36" height="9" rx="4.5" fill={input.fill} stroke={INK} strokeWidth="1.25" />
        <text x={input.x} y="114" textAnchor="middle" style={SANS} fontSize="8" fontWeight="600" fill={INK}>
          Input
        </text>
      </g>
    ))}
  </Frame>
);

/* ---------- 4 Prioritize: RICE ---------- */

export const RICE_SIZE = { w: 172, h: 104 };
const RICE_COLUMNS = [
  { label: 'R', x: 24 },
  { label: 'I', x: 50 },
  { label: 'C', x: 76 },
  { label: 'E', x: 102 },
  { label: 'Score', x: 142 },
];
// Bar lengths only (no numbers): the first row wins
const RICE_ROWS = [
  [16, 14, 15, 8, 34],
  [10, 12, 9, 13, 22],
  [12, 7, 11, 15, 14],
];

export const RiceCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...RICE_SIZE} title="RICE" step="4 Prioritize">
    {/* The winning row lights up marigold */}
    <motion.rect
      className="m-final"
      x="8"
      y="43"
      width="156"
      height="17"
      rx="4"
      fill="#E8B04A"
      stroke={INK}
      strokeWidth="1.25"
      initial={{ opacity: 0 }}
      animate={on ? { opacity: 1 } : undefined}
      transition={{ delay: delay + 0.45, duration: 0.3 }}
    />
    {RICE_COLUMNS.map((col) => (
      <text key={col.label} x={col.x} y="38" textAnchor="middle" style={SANS} fontSize="8" fontWeight="700" fill={INK}>
        {col.label}
      </text>
    ))}
    <line x1="10" y1="41" x2="162" y2="41" stroke={INK} strokeWidth="1" opacity="0.4" />
    {RICE_ROWS.map((row, r) =>
      row.map((w, c) => {
        const cx = RICE_COLUMNS[c].x;
        const score = c === 4;
        return (
          <motion.rect
            key={`${r}-${c}`}
            className="m-final"
            x={cx - w / 2}
            y={49 + r * 18}
            width={w}
            height="5"
            rx="2.5"
            fill={score ? '#9E4524' : r === 0 ? INK : '#D98E6C'}
            opacity={score || r === 0 ? 1 : 0.85}
            style={{ originX: 0.5 }}
            initial={{ scaleX: 0 }}
            animate={on ? { scaleX: 1 } : undefined}
            transition={{ delay: delay + r * 0.08 + c * 0.04, duration: 0.3, ease: EASE }}
          />
        );
      })
    )}
  </Frame>
);

/* ---------- 2 Design: wireframe + user flow ---------- */

export const WIREFLOW_SIZE = { w: 176, h: 100 };
const PHONES = [14, 70, 126];

export const WireflowCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...WIREFLOW_SIZE} title="Wireframe" step="2 Design">
    {PHONES.map((x, i) => (
      <g key={x}>
        <rect x={x} y="32" width="36" height="58" rx="5" fill={i === 1 ? '#F3D9CC' : '#FBF8F1'} stroke={INK} strokeWidth="1.5" />
        <line x1={x + 13} y1="36" x2={x + 23} y2="36" stroke={INK} strokeWidth="1.25" strokeLinecap="round" />
        {i < 2 && (
          <g fill={INK} opacity="0.55">
            <rect x={x + 6} y="43" width="24" height="4" rx="2" />
            <rect x={x + 6} y="51" width="18" height="4" rx="2" />
          </g>
        )}
        {i === 0 && <rect x={x + 6} y="60" width="24" height="16" rx="2" fill="#EFE8D8" stroke={INK} strokeWidth="1" />}
        {i === 1 && <rect x={x + 6} y="72" width="24" height="9" rx="4.5" fill="#C2603A" stroke={INK} strokeWidth="1.25" />}
        {i === 2 && (
          <>
            <circle cx={x + 18} cy="61" r="10" fill="#E8B04A" stroke={INK} strokeWidth="1.5" />
            <path d={`M${x + 13} 61 L${x + 17} 65 L${x + 23.5} 57`} fill="none" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </g>
    ))}
    {/* Flow arrows between the screens */}
    {[0, 1].map((i) => {
      const x1 = PHONES[i] + 39;
      const x2 = PHONES[i + 1] - 3;
      return (
        <g key={i} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <Draw on={on} delay={delay + i * 0.3} d={`M${x1} 61 L${x2} 61`} />
          <Draw on={on} delay={delay + i * 0.3 + 0.2} d={`M${x2 - 4} 57.5 L${x2} 61 L${x2 - 4} 64.5`} />
        </g>
      );
    })}
  </Frame>
);

/* ---------- 5 Launch: GTM plan ---------- */

export const GTM_SIZE = { w: 170, h: 100 };
const GTM_ROWS = [
  { label: 'Audience', w: 44 },
  { label: 'Channels', w: 34 },
  { label: 'Message', w: 50 },
];

export const GtmCard: React.FC<CardProps> = ({ on, delay }) => (
  <Frame {...GTM_SIZE} title="GTM plan" step="5 Launch">
    {/* A small rocket that lifts a little */}
    <motion.g
      className="m-final"
      initial={{ y: 8 }}
      animate={on ? { y: 0 } : undefined}
      transition={{ delay, duration: 0.8, ease: EASE }}
    >
      <path d="M22 80 C 23 86, 27 91, 27 91 C 27 91, 31 86, 32 80 Z" fill="#E8B04A" stroke={INK} strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M19 66 L12 76 L13 81 L20 76 Z" fill="#C2603A" stroke={INK} strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M35 66 L42 76 L41 81 L34 76 Z" fill="#C2603A" stroke={INK} strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M27 34 C 36 42, 38 58, 35 80 L19 80 C 16 58, 18 42, 27 34 Z" fill="#FBF8F1" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="27" cy="54" r="5" fill="#F3D9CC" stroke={INK} strokeWidth="1.25" />
    </motion.g>
    {GTM_ROWS.map((row, i) => {
      const y = 46 + i * 18;
      return (
        <g key={row.label}>
          <text x="54" y={y} style={SANS} fontSize="8" fontWeight="600" fill={INK}>
            {row.label}
          </text>
          <motion.rect
            className="m-final"
            x="104"
            y={y - 6}
            width={row.w}
            height="6"
            rx="3"
            fill={i === 0 ? '#C2603A' : i === 1 ? '#D98E6C' : '#E8B04A'}
            style={{ originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={on ? { scaleX: 1 } : undefined}
            transition={{ delay: delay + 0.2 + i * 0.12, duration: 0.4, ease: EASE }}
          />
        </g>
      );
    })}
  </Frame>
);

/* ---------- 6 Measure: HEART ---------- */

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
  <Frame {...HEART_SIZE} title="HEART" step="6 Measure">
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

/* ---------- 7 AI PM: an LLM workflow ---------- */

// Course terms only: Week 5 covers LLMs, prompting and evals (not retrieval or agents), so the pipeline is
// Docs -> Prompt -> LLM -> Answer, with an eval loop from the LLM back to the prompt.
export const AI_SIZE = { w: 308, h: 152 };
const AI_LABELS = [
  { label: 'Docs', x: 44 },
  { label: 'Prompt', x: 118 },
  { label: 'LLM', x: 192 },
  { label: 'Answer', x: 266 },
];
// Arrows between the nodes, along y = 94
const AI_ARROWS = [
  [66, 92],
  [142, 164],
  [219, 239],
];

const AI_NODES: React.ReactNode[] = [
  // Docs: a small stack of pages
  <g key="docs">
    <rect x="39" y="74" width="22" height="28" rx="2.5" fill="#EFE8D8" stroke={INK} strokeWidth="1.5" />
    <rect x="35" y="79" width="22" height="28" rx="2.5" fill="#F6F1E7" stroke={INK} strokeWidth="1.5" />
    <path d="M 31 84 H 47 L 53 90 V 112 H 31 Z" fill="#FBF8F1" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 47 84 V 90 H 53" fill="none" stroke={INK} strokeWidth="1.25" strokeLinejoin="round" />
    <path d="M 35 96 H 48 M 35 101 H 45 M 35 106 H 47" stroke={INK} strokeWidth="1.25" strokeLinecap="round" opacity="0.6" />
  </g>,
  // Prompt: a text box with a caret
  <g key="prompt">
    <rect x="98" y="78" width="40" height="32" rx="5" fill="#F3D9CC" stroke={INK} strokeWidth="1.5" />
    <path d="M 105 89 L 110 94 L 105 99" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 114 99 H 124" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="127" y="92" width="3" height="8" rx="1" fill="#9E4524" />
  </g>,
  // LLM: a terracotta chip with a cream sparkle that twinkles slowly (paused off-screen)
  <g key="llm">
    <path
      d="M 184 71 V 76 M 192 71 V 76 M 200 71 V 76 M 184 112 V 117 M 192 112 V 117 M 200 112 V 117 M 169 86 H 174 M 169 102 H 174 M 210 86 H 215 M 210 102 H 215"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <rect x="174" y="76" width="36" height="36" rx="7" fill="#C2603A" stroke={INK} strokeWidth="1.5" />
    <g transform="translate(192 94) scale(0.95)">
      <path className="illo-twinkle" style={{ '--dur': '4.8s', '--delay': '0s' } as React.CSSProperties} d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="#F6F1E7" />
    </g>
  </g>,
  // Answer: a chat bubble with two lines and a check
  <g key="answer">
    <path
      d="M 248 79 H 284 A 4 4 0 0 1 288 83 V 105 A 4 4 0 0 1 284 109 H 258 L 250 115 V 109 H 248 A 4 4 0 0 1 244 105 V 83 A 4 4 0 0 1 248 79 Z"
      fill="#FBF8F1"
      stroke={INK}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <rect x="251" y="86" width="24" height="3.5" rx="1.75" fill={INK} opacity="0.55" />
    <rect x="251" y="93" width="16" height="3.5" rx="1.75" fill={INK} opacity="0.55" />
    <circle cx="281" cy="102" r="6" fill="#E8B04A" stroke={INK} strokeWidth="1.25" />
    <path d="M 278 102 L 280.3 104.3 L 284.2 99.8" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </g>,
];

export const AiCard: React.FC<CardProps> = ({ on, delay }) => {
  const step = 0.28;
  return (
    <Frame {...AI_SIZE} title="AI workflow" titleSize={17} step="7 AI PM" stepSize={14.2}>
      {/* "AI track" pill in the header */}
      <rect x="128" y="8" width="74" height="22" rx="11" fill="#E8B04A" stroke={INK} strokeWidth="1.25" />
      <text x="165" y="24" textAnchor="middle" style={SANS} fontSize="14.2" fontWeight="700" fill={INK}>
        AI track
      </text>

      {/* The pipeline lights up node by node */}
      {AI_NODES.map((node, i) => (
        <Pop key={AI_LABELS[i].label} on={on} delay={delay + i * step} from={0.6}>
          {node}
          <text x={AI_LABELS[i].x} y="141" textAnchor="middle" style={SANS} fontSize="14.5" fontWeight="600" fill={INK}>
            {AI_LABELS[i].label}
          </text>
        </Pop>
      ))}
      {AI_ARROWS.map(([x1, x2], i) => (
        <g key={x1} fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <Draw on={on} delay={delay + i * step + 0.14} d={`M${x1} 94 L${x2} 94`} />
          <Draw on={on} delay={delay + i * step + 0.3} d={`M${x2 - 4} 90.5 L${x2} 94 L${x2 - 4} 97.5`} />
        </g>
      ))}

      {/* Eval loop: from the LLM back to the prompt, drawn last */}
      <g fill="none" stroke="#9E4524" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <Draw on={on} delay={delay + 4 * step + 0.1} duration={0.6} d="M190 68 C 184 48, 126 48, 120 74" />
        <Draw on={on} delay={delay + 4 * step + 0.65} d={arrowHead(121, 66, 120, 74, 5)} />
      </g>
      <Pop on={on} delay={delay + 4 * step + 0.4} from={0.8}>
        <text x="155" y="47" textAnchor="middle" style={SANS} fontSize="14.2" fontWeight="700" fill="#9E4524">
          Eval loop
        </text>
      </Pop>
    </Frame>
  );
};

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
