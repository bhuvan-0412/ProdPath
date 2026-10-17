import React from 'react';
import { GlowCard } from '@/components/GlowCard';

interface TrailMapProps {
  weekCount: number;
}

// Milestones climb from Week 1 (bottom) to Week 5 (top), alternating sides like switchbacks
const STOPS = [
  { x: 64, y: 396, labelX: 84, anchor: 'start' as const },
  { x: 282, y: 312, labelX: 262, anchor: 'end' as const },
  { x: 92, y: 228, labelX: 112, anchor: 'start' as const },
  { x: 270, y: 142, labelX: 250, anchor: 'end' as const },
  { x: 150, y: 64, labelX: 196, anchor: 'start' as const },
];

const TRAIL =
  'M64 396 C180 410 304 372 282 312 C262 258 104 284 92 228 C80 176 258 196 270 142 C282 96 188 86 150 64';

// Faint contour lines, like the elevation rings on a hiking map
const CONTOURS = [
  'M-10 360 C80 330 140 380 220 350 S330 300 380 330',
  'M-10 270 C60 250 150 300 230 262 S340 220 380 250',
  'M-10 180 C90 150 160 205 240 170 S330 130 380 160',
  'M-10 96 C70 80 130 118 210 92 S320 50 380 76',
];

export const TrailMap: React.FC<TrailMapProps> = ({ weekCount }) => {
  const stops = STOPS.slice(0, weekCount);
  const last = stops.length - 1;

  return (
    <GlowCard as="figure" className="relative rounded-card border border-line bg-surface p-4 sm:p-5">
      <svg
        viewBox="0 0 350 440"
        className="w-full h-auto font-sans"
        role="img"
        aria-labelledby="trail-title"
      >
        <title id="trail-title">
          {`A trail map of the path: ${weekCount} milestones from Week 1, marked Start here, up to Week ${weekCount}, marked with a flag.`}
        </title>

        <g className="stroke-line" fill="none" strokeWidth="1">
          {CONTOURS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* The footpath */}
        <path
          d={TRAIL}
          fill="none"
          className="stroke-ink/70"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />

        {stops.map((stop, i) => {
          const isFirst = i === 0;
          const isLast = i === last;
          return (
            <g key={i}>
              <circle
                cx={stop.x}
                cy={stop.y}
                r={isFirst || isLast ? 7 : 5.5}
                className={isFirst ? 'fill-accent stroke-accent' : isLast ? 'fill-surface stroke-ink' : 'fill-surface stroke-ink'}
                strokeWidth="1.5"
              />

              {isLast && (
                <g>
                  <line x1={stop.x} y1={stop.y - 7} x2={stop.x} y2={stop.y - 46} className="stroke-ink" strokeWidth="1.5" />
                  <path d={`M${stop.x} ${stop.y - 46} L${stop.x + 26} ${stop.y - 38} L${stop.x} ${stop.y - 30} Z`} className="fill-marigold" />
                </g>
              )}

              <text
                x={stop.labelX}
                y={isFirst ? stop.y - 2 : stop.y + 4}
                textAnchor={stop.anchor}
                className="fill-ink"
                fontSize="13"
                fontWeight="600"
              >
                {`Week ${i + 1}`}
              </text>
              {isFirst && (
                <text x={stop.labelX} y={stop.y + 14} textAnchor={stop.anchor} className="fill-accent-dark" fontSize="11.5" fontWeight="600">
                  Start here
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </GlowCard>
  );
};
