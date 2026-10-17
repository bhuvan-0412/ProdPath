import React from 'react';

// Decorative, static landing-page details. Everything here is aria-hidden and ignores the pointer.

/* ---------- The winding trail ---------- */

// Each section draws its own piece of the trail in the left page margin. Pieces are drawn at 1:1 pixel scale
// (never stretched), so the dots stay round. Every piece starts and ends at the same x (the margin's centre
// line), so they join up at the section edges: a 240px weave at the top of a section, a straight run down
// the middle, and a 240px weave at the bottom.
const PIECE = 240;
const WIDE = { width: 120, cx: 60 };
const NARROW = { width: 24, cx: 12 };

type Shape = 'a' | 'b' | 'c' | 'd';

// Hand-shaped weaves for the wide margin (x 30..90 around the centre line at 60)
const SHAPES: Record<Shape, string> = {
  a: 'M60 0 C60 46 86 62 86 112 C86 162 52 176 56 214 C57 228 60 234 60 240',
  b: 'M60 0 C60 40 34 58 36 104 C38 150 82 160 80 200 C79 222 60 230 60 240',
  c: 'M60 0 C62 52 90 74 84 124 C78 168 40 170 44 208 C46 226 60 232 60 240',
  d: 'M60 0 C58 44 30 70 38 118 C46 160 78 168 74 206 C72 226 60 232 60 240',
};
// The last piece stops short so the flag can stand at its end
const END_SHAPE = 'M60 0 C60 44 84 64 82 108 C80 150 56 160 60 196';

// Narrow margins (768-1407px wide screens): the same weave squeezed to a gentle wobble.
// Only the path's x coordinates move; the dots themselves are never scaled.
const narrow = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) =>
    `${Math.round((NARROW.cx + (Number(x) - WIDE.cx) * 0.2) * 10) / 10} ${y}`
  );

const DOTS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeDasharray: '0 9',
};

interface TrailSegmentProps {
  /** Weave at the top of the section (omit for the first section, where the trail begins) */
  top?: Shape;
  /** Weave at the bottom of the section; "end" finishes the trail with a flag */
  bottom: Shape | 'end';
  /** Start the trail with a dot at the top of the bottom weave (first section only) */
  start?: boolean;
}

const TrailPieces: React.FC<TrailSegmentProps & { wide: boolean }> = ({ top, bottom, start, wide }) => {
  const { width, cx } = wide ? WIDE : NARROW;
  const shape = (d: string) => (wide ? d : narrow(d));
  const bottomPath = bottom === 'end' ? END_SHAPE : SHAPES[bottom];

  return (
    <>
      {top && (
        <svg focusable="false" width={width} height={PIECE} viewBox={`0 0 ${width} ${PIECE}`} overflow="visible" className="absolute top-0 left-0">
          <path d={shape(SHAPES[top])} {...DOTS} className="text-accent/25" />
          {/* Milestone ring where this section meets the one above */}
          <circle cx={cx} cy={0} r={wide ? 5 : 4} strokeWidth="1.5" className="fill-paper stroke-accent/50" />
        </svg>
      )}
      {top && (
        <svg focusable="false" width={width} className="absolute left-0" style={{ top: PIECE, bottom: PIECE, height: `calc(100% - ${PIECE * 2}px)` }}>
          <line x1={cx} y1="0" x2={cx} y2="100%" {...DOTS} className="text-accent/25" />
        </svg>
      )}
      <svg focusable="false" width={width} height={PIECE} viewBox={`0 0 ${width} ${PIECE}`} overflow="visible" className="absolute bottom-0 left-0">
        <path d={shape(bottomPath)} {...DOTS} className="text-accent/25" />
        {start && <circle cx={cx} cy={0} r={3.5} className="fill-accent/40" />}
        {bottom === 'end' && (
          <>
            <line x1={cx} y1={196} x2={cx} y2={170} strokeWidth="1.5" strokeLinecap="round" className="stroke-ink/40" />
            <path d={`M${cx} 170 L${cx + 14} 175.5 L${cx} 181 Z`} className="fill-marigold" />
          </>
        )}
      </svg>
    </>
  );
};

// Hidden under 768px. Sits in the left page margin, so it never crosses text or cards.
export const TrailSegment: React.FC<TrailSegmentProps> = (props) => (
  <>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-6 hidden md:block min-[1408px]:hidden">
      <TrailPieces {...props} wide={false} />
    </div>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-[120px] hidden min-[1408px]:block left-[calc((100%_-_1216px)/4_-_60px)]"
    >
      <TrailPieces {...props} wide />
    </div>
  </>
);

// A straight run of the trail for slim strips (shorter than one weave), joining the pieces above and below
export const TrailStraight: React.FC = () => (
  <>
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-y-0 left-0 h-full hidden md:block min-[1408px]:hidden" width={NARROW.width}>
      <line x1={NARROW.cx} y1="0" x2={NARROW.cx} y2="100%" {...DOTS} className="text-accent/25" />
    </svg>
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-y-0 h-full hidden min-[1408px]:block left-[calc((100%_-_1216px)/4_-_60px)]"
      width={WIDE.width}
    >
      <line x1={WIDE.cx} y1="0" x2={WIDE.cx} y2="100%" {...DOTS} className="text-accent/25" />
    </svg>
  </>
);

/* ---------- Notebook dots ---------- */

// A very faint 24px dot grid, drawn with an SVG pattern
export const NotebookDots: React.FC = () => (
  <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 w-full h-full text-ink/[0.08]">
    <defs>
      <pattern id="notebook-dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="12" cy="12" r="0.75" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#notebook-dots)" />
  </svg>
);
