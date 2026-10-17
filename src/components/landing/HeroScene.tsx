import React from 'react';

// The hero illustration: a PM's desk floating over terracotta hills, with a dotted trail up to a flag.
// Pure decoration (aria-hidden). Colors swap for dark mode through the .illo variables in globals.css.
// Each object floats on its own timing (outer <g>) while keeping its tilt (inner <g transform>).

type Float = { float: number; dur: number; delay: number };

const floatStyle = ({ float, dur, delay }: Float) =>
  ({ '--float': `${-float}px`, '--dur': `${dur}s`, '--delay': `${-delay}s` }) as React.CSSProperties;

const FloatingObject: React.FC<Float & { className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
  ...timing
}) => (
  <g className={`illo-float ${className}`} style={floatStyle(timing)}>
    {children}
  </g>
);

const SPARKLE = 'M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z';

const Sparkle: React.FC<{ at: string; dur: number; delay: number }> = ({ at, dur, delay }) => (
  <g transform={at}>
    <path
      className="illo-twinkle"
      style={{ '--dur': `${dur}s`, '--delay': `${-delay}s` } as React.CSSProperties}
      d={SPARKLE}
      fill="#E8B04A"
      stroke="#1F2430"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </g>
);

export const HeroScene: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 680 440"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className={`illo block w-full h-auto ${className}`}
  >
    <defs>
      <clipPath id="hero-scene-clip">
        <rect x="0" y="0" width="680" height="440" rx="12" />
      </clipPath>
    </defs>
    <g clipPath="url(#hero-scene-clip)">
      {/* Sky, sun and hills */}
      <rect className="illo-sky" x="0" y="0" width="680" height="440" fill="#F6F1E7" />
      <circle className="illo-sun" cx="550" cy="120" r="64" fill="#F3D9CC" />
      <path d="M0 330 C 90 300, 170 300, 250 320 C 320 338, 350 255, 410 250 C 470 246, 520 300, 600 305 C 640 308, 660 300, 680 296 L680 440 L0 440 Z" fill="#EBC3AE" />
      <path d="M0 385 C 90 335, 200 345, 290 368 C 400 398, 500 345, 680 362 L680 440 L0 440 Z" fill="#D98E6C" />
      <path d="M0 420 C 120 392, 260 406, 360 416 C 460 426, 580 398, 680 408 L680 440 L0 440 Z" fill="#9E4524" />

      {/* Trail up to the summit flag */}
      <path d="M110 410 C 160 402, 210 408, 245 386 C 290 360, 330 352, 360 320 C 380 298, 395 272, 410 252" fill="none" stroke="#1F2430" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="0.1 9" />
      <circle cx="245" cy="386" r="6" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
      <circle cx="360" cy="320" r="6" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
      <line x1="410" y1="252" x2="410" y2="206" stroke="#1F2430" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M410 206 L438 216 L410 226 Z" fill="#E8B04A" stroke="#1F2430" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Kanban board */}
      <FloatingObject float={5} dur={6.4} delay={0}>
        <g transform="translate(30,50) rotate(-4 100 52)">
          <rect className="illo-shadow" x="4" y="4" width="200" height="104" rx="8" fill="#1F2430" />
          <rect x="0" y="0" width="200" height="104" rx="8" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
          <rect x="12" y="12" width="48" height="6" rx="3" fill="#C2603A" />
          <rect x="76" y="12" width="48" height="6" rx="3" fill="#E8B04A" />
          <rect x="140" y="12" width="48" height="6" rx="3" fill="#1F2430" />
          <rect x="12" y="28" width="48" height="16" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="12" y="50" width="48" height="16" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="12" y="72" width="48" height="16" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="76" y="28" width="48" height="16" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="76" y="50" width="48" height="16" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="140" y="28" width="48" height="16" rx="4" fill="#E8B04A" stroke="#1F2430" strokeWidth="1.5" />
        </g>
      </FloatingObject>

      {/* Sticky note */}
      <FloatingObject float={6} dur={5.2} delay={1.7}>
        <g transform="translate(300,30) rotate(7 48 48)">
          <rect className="illo-shadow" x="4" y="4" width="96" height="96" rx="4" fill="#1F2430" />
          <rect x="0" y="0" width="96" height="96" rx="4" fill="#E8B04A" stroke="#1F2430" strokeWidth="2" />
          <rect x="14" y="20" width="60" height="5" rx="2.5" fill="#9E4524" />
          <rect x="14" y="34" width="46" height="5" rx="2.5" fill="#9E4524" />
          <rect x="14" y="48" width="54" height="5" rx="2.5" fill="#9E4524" />
          <path d="M16 72 L23 79 L36 64" fill="none" stroke="#1F2430" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </FloatingObject>

      {/* Persona card (hidden on phones) */}
      <FloatingObject float={4} dur={7.6} delay={3.1} className="illo-hide-sm">
        <g transform="translate(455,40) rotate(3 75 42)">
          <rect className="illo-shadow" x="4" y="4" width="150" height="84" rx="8" fill="#1F2430" />
          <rect x="0" y="0" width="150" height="84" rx="8" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
          <circle cx="30" cy="34" r="18" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <circle cx="30" cy="29" r="5.5" fill="#1F2430" />
          <path d="M20 47 C 20 39, 40 39, 40 47 Z" fill="#1F2430" />
          <rect x="58" y="22" width="76" height="6" rx="3" fill="#1F2430" />
          <rect x="58" y="36" width="54" height="5" rx="2.5" fill="#E8B9A3" />
          <rect x="14" y="62" width="40" height="12" rx="6" fill="#C2603A" />
          <rect x="60" y="62" width="34" height="12" rx="6" fill="#E8B04A" />
        </g>
      </FloatingObject>

      {/* Website wireframe (hidden on phones) */}
      <FloatingObject float={5} dur={8} delay={4.4} className="illo-hide-sm">
        <g transform="translate(36,190) rotate(-2 85 55)">
          <rect className="illo-shadow" x="4" y="4" width="170" height="110" rx="8" fill="#1F2430" />
          <rect x="0" y="0" width="170" height="110" rx="8" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
          <line x1="0" y1="22" x2="170" y2="22" stroke="#1F2430" strokeWidth="1.5" />
          <circle cx="14" cy="11" r="3.5" fill="#C2603A" />
          <circle cx="26" cy="11" r="3.5" fill="#E8B04A" />
          <circle cx="38" cy="11" r="3.5" fill="#1F2430" />
          <rect x="12" y="32" width="146" height="32" rx="4" fill="#F3D9CC" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="20" y="46" width="40" height="10" rx="5" fill="#9E4524" />
          <rect x="12" y="72" width="68" height="28" rx="4" fill="#EFE8D8" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="90" y="72" width="68" height="28" rx="4" fill="#EFE8D8" stroke="#1F2430" strokeWidth="1.5" />
        </g>
      </FloatingObject>

      {/* Bar chart */}
      <FloatingObject float={6} dur={6.8} delay={2.3}>
        <g transform="translate(480,190) rotate(2 75 55)">
          <rect className="illo-shadow" x="4" y="4" width="150" height="110" rx="8" fill="#1F2430" />
          <rect x="0" y="0" width="150" height="110" rx="8" fill="#FBF8F1" stroke="#1F2430" strokeWidth="2" />
          <rect x="20" y="76" width="20" height="24" rx="3" fill="#EBC3AE" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="50" y="60" width="20" height="40" rx="3" fill="#D98E6C" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="80" y="42" width="20" height="58" rx="3" fill="#C2603A" stroke="#1F2430" strokeWidth="1.5" />
          <rect x="110" y="22" width="20" height="78" rx="3" fill="#9E4524" stroke="#1F2430" strokeWidth="1.5" />
          <line x1="12" y1="100" x2="138" y2="100" stroke="#1F2430" strokeWidth="2" strokeLinecap="round" />
          <circle cx="120" cy="14" r="6" fill="#E8B04A" stroke="#1F2430" strokeWidth="1.5" />
        </g>
      </FloatingObject>

      {/* MVP tag */}
      <FloatingObject float={4} dur={5.6} delay={0.9}>
        <g transform="translate(232,196) rotate(-8 26 11)">
          <rect className="illo-shadow" x="3" y="3" width="52" height="22" rx="11" fill="#1F2430" />
          <rect x="0" y="0" width="52" height="22" rx="11" fill="#9E4524" stroke="#1F2430" strokeWidth="1.5" />
          <text x="26" y="15" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#F6F1E7">
            MVP
          </text>
        </g>
      </FloatingObject>

      {/* Sparkles */}
      <Sparkle at="translate(300,176)" dur={3.4} delay={0} />
      <Sparkle at="translate(256,40) scale(0.7)" dur={4.1} delay={1.4} />
      <Sparkle at="translate(648,170) scale(0.8)" dur={3.7} delay={2.6} />
    </g>
  </svg>
);
