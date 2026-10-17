'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import './reducedMotion';

// The winding trail in the left page margin (decorative, aria-hidden, ignores the pointer).
// Each landing section draws its own piece; pieces start and end on the margin's centre line, so they join
// at the section edges: a 240px weave at the top, a straight run, and a 240px weave at the bottom.
// As the visitor scrolls, the piece draws itself and a small marigold dot travels along it.
// With reduced motion the whole trail is simply shown, without the dot.

const PIECE = 240;
const WIDE = { width: 120, cx: 60 };
const NARROW = { width: 24, cx: 12 };

type Shape = 'a' | 'b' | 'c' | 'd';

// Hand-shaped weaves for the wide margin (x 30..90 around the centre line at 60), y from 0 to 240
const SHAPES: Record<Shape, string> = {
  a: 'M60 0 C60 46 86 62 86 112 C86 162 52 176 56 214 C57 228 60 234 60 240',
  b: 'M60 0 C60 40 34 58 36 104 C38 150 82 160 80 200 C79 222 60 230 60 240',
  c: 'M60 0 C62 52 90 74 84 124 C78 168 40 170 44 208 C46 226 60 232 60 240',
  d: 'M60 0 C58 44 30 70 38 118 C46 160 78 168 74 206 C72 226 60 232 60 240',
};
// The last piece stops short so the flag can stand at its end
const END_SHAPE = 'M60 0 C60 44 84 64 82 108 C80 150 56 160 60 196';
const END_Y = 196;

const PAIR = /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g;
const shiftY = (d: string, dy: number) => d.replace(PAIR, (_, x: string, y: string) => `${x} ${Number(y) + dy}`);
// Narrow margins (768-1407px): the same weave squeezed to a gentle wobble (only x moves)
const narrow = (d: string) =>
  d.replace(PAIR, (_, x: string, y: string) => `${Math.round((NARROW.cx + (Number(x) - WIDE.cx) * 0.2) * 10) / 10} ${y}`);

interface TrailProps {
  /** Weave at the top of the section (omit where the trail runs straight in, or for the first section) */
  top?: Shape;
  /** Weave at the bottom; "end" finishes the trail with a flag; omit for a straight run */
  bottom?: Shape | 'end';
  /** The trail begins here, at the top of the bottom weave (first section only) */
  start?: boolean;
}

const buildPath = ({ top, bottom, start }: TrailProps, height: number) => {
  const bottomShape = bottom === 'end' ? END_SHAPE : bottom ? SHAPES[bottom] : null;
  const bottomAt = height - PIECE;
  if (start && bottomShape) return shiftY(bottomShape, bottomAt);

  let d = top ? SHAPES[top] : `M${WIDE.cx} 0`;
  const straightEnd = bottomShape ? bottomAt : height;
  if (straightEnd > (top ? PIECE : 0)) d += ` L${WIDE.cx} ${straightEnd}`;
  if (bottomShape) d += ' ' + shiftY(bottomShape, bottomAt).replace(/^M/, 'L');
  return d;
};

const TrailPiece: React.FC<TrailProps & { wide: boolean; className: string }> = ({ wide, className, ...props }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [height, setHeight] = useState(0);
  const maskId = useId();
  const reduce = useReducedMotion();
  const { width, cx } = wide ? WIDE : NARROW;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(Math.round(el.clientHeight)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 0 when the section's top reaches the middle of the screen, 1 when its bottom does
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 55%', 'end 55%'] });
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.01, 0.99, 1], [0, 1, 1, 0]);
  const flagOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const path = pathRef.current;
    if (!path) return;
    const point = path.getPointAtLength(v * path.getTotalLength());
    dotX.set(point.x);
    dotY.set(point.y);
  });

  const valid = height >= (props.top && props.bottom ? PIECE * 2 : PIECE) || (!props.top && !props.bottom && height > 0);
  const d = valid ? (wide ? buildPath(props, height) : narrow(buildPath(props, height))) : '';
  const endY = height - PIECE + END_Y;

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none absolute inset-y-0 ${className}`}>
      {valid && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible" focusable="false" className="block">
          {!reduce && (
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={width + 40} height={height + 40}>
                <motion.path d={d} fill="none" stroke="white" strokeWidth="16" strokeLinecap="butt" style={{ pathLength: scrollYProgress }} />
              </mask>
            </defs>
          )}
          <path
            ref={pathRef}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="0 9"
            mask={reduce ? undefined : `url(#${maskId})`}
            className="text-accent/30"
          />
          {/* Milestone ring where this section meets the one above */}
          {props.top && <circle cx={cx} cy={0} r={wide ? 5 : 4} strokeWidth="1.5" className="fill-paper stroke-accent/50" />}
          {props.start && <circle cx={cx} cy={height - PIECE} r={3.5} className="fill-accent/40" />}
          {props.bottom === 'end' && (
            <motion.g style={{ opacity: reduce ? 1 : flagOpacity }}>
              <line x1={cx} y1={endY} x2={cx} y2={endY - 26} strokeWidth="1.5" strokeLinecap="round" className="stroke-ink/40" />
              <path d={`M${cx} ${endY - 26} L${cx + 14} ${endY - 20.5} L${cx} ${endY - 15} Z`} className="fill-marigold" />
            </motion.g>
          )}
          {/* The traveller: marks how far down the page the visitor is */}
          {!reduce && (
            <motion.circle cx={0} cy={0} r={wide ? 4.5 : 3.5} className="fill-marigold stroke-ink/30" strokeWidth="1" style={{ x: dotX, y: dotY, opacity: dotOpacity }} />
          )}
        </svg>
      )}
    </div>
  );
};

// Hidden under 768px. Sits in the left page margin, so it never crosses text or cards.
export const TrailSegment: React.FC<TrailProps> = (props) => (
  <>
    <TrailPiece {...props} wide={false} className="left-0 w-6 hidden md:block min-[1408px]:hidden" />
    <TrailPiece {...props} wide className="w-[120px] hidden min-[1408px]:block left-[calc((100%_-_1216px)/4_-_60px)]" />
  </>
);
