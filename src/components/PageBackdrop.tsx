import React from 'react';
import { ICON_PATHS, type IconKind } from '@/components/pmIcons';

// A fixed, very faint decorative layer behind a signed-in page. Static (no animation), aria-hidden and
// ignores the pointer. It sits under everything (-z-10), so cards, inputs, the navbar and the footer keep
// their solid backgrounds on top of it. Drawn in the ink color, which turns cream in dark mode.
//
// Place it outside the page's animate-fade-in wrapper: an animated (transformed) parent would stop
// "fixed" from pinning it to the screen.

export type BackdropVariant = 'icons' | 'dots' | 'contours';

// Scattered icons, in percent of the screen; the ones marked `phone` also show on small screens
const ICONS: { kind: IconKind; x: number; y: number; size: number; rot: number; phone?: boolean }[] = [
  { kind: 'lightbulb', x: 4, y: 16, size: 34, rot: -10, phone: true },
  { kind: 'target', x: 90, y: 12, size: 32, rot: 0, phone: true },
  { kind: 'chart', x: 46, y: 6, size: 28, rot: 4 },
  { kind: 'chat', x: 94, y: 48, size: 30, rot: 6 },
  { kind: 'puzzle', x: 2, y: 52, size: 30, rot: 12, phone: true },
  { kind: 'note', x: 30, y: 88, size: 30, rot: -6 },
  { kind: 'cursor', x: 68, y: 92, size: 26, rot: -8, phone: true },
  { kind: 'search', x: 92, y: 82, size: 30, rot: 10 },
  { kind: 'flag', x: 6, y: 86, size: 28, rot: 0 },
  { kind: 'target', x: 60, y: 40, size: 26, rot: 0 },
  { kind: 'lightbulb', x: 24, y: 34, size: 26, rot: 8 },
];

// Hand-shaped, gently wandering lines (drawn on a 1440 x 900 canvas, stretched to the screen)
const CONTOURS = [
  'M-20 120 C 220 80, 420 170, 680 130 S 1120 60, 1460 110',
  'M-20 230 C 180 200, 460 280, 720 240 S 1180 170, 1460 220',
  'M-20 350 C 260 310, 500 400, 760 360 S 1160 300, 1460 340',
  'M-20 470 C 200 440, 440 520, 700 480 S 1200 410, 1460 460',
  'M-20 600 C 240 560, 520 640, 780 600 S 1140 540, 1460 590',
  'M-20 720 C 220 690, 480 770, 740 730 S 1180 660, 1460 710',
  'M-20 840 C 260 810, 500 880, 760 850 S 1160 790, 1460 830',
];

// A short dotted trail down the left edge, on screens 1280px and wider
const TRAIL = 'M14 0 C14 40 22 60 22 100 C22 140 8 150 9 190 C10 230 20 250 19 290 C18 330 10 350 12 390 C13 410 14 420 14 440';

export const PageBackdrop: React.FC<{ variant: BackdropVariant }> = ({ variant }) => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-ink">
    {variant === 'dots' && (
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" focusable="false">
        <defs>
          <pattern id="backdrop-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.75" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#backdrop-dots)" />
      </svg>
    )}

    {variant === 'contours' && (
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1440 900" preserveAspectRatio="none" focusable="false">
        {CONTOURS.map((d) => (
          <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    )}

    {variant === 'icons' && (
      <div className="absolute inset-0 opacity-[0.06]">
        {ICONS.map((icon, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={icon.size}
            height={icon.size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
            className={`absolute ${icon.phone ? '' : 'hidden md:block'}`}
            style={{ left: `${icon.x}%`, top: `${icon.y}%`, transform: `rotate(${icon.rot}deg)` }}
          >
            {ICON_PATHS[icon.kind]}
          </svg>
        ))}
      </div>
    )}

    <svg className="absolute left-1 top-28 hidden xl:block opacity-[0.12]" width="28" height="460" viewBox="0 0 28 460" focusable="false">
      <path d={TRAIL} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0 9" />
      <circle cx="14" cy="448" r="4" className="fill-marigold" />
    </svg>
  </div>
);
