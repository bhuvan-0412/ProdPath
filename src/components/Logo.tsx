import React from 'react';

interface LogoProps {
  /** Height and width of the mark in pixels */
  size?: number;
  /** Show the "ProdPath" wordmark next to the mark */
  showWordmark?: boolean;
  className?: string;
}

// The ProdPath mark: a winding cream road on a terracotta circle, ending at a marigold dot.
// Colors are fixed so the mark looks the same in light and dark mode.
export const LogoMark: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 96 96"
    aria-hidden="true"
    focusable="false"
    className={`flex-shrink-0 ${className}`}
  >
    <circle cx="48" cy="48" r="48" fill="#9E4524" />
    <path
      d="M31.5 75 C 31.5 55, 67.5 59, 67.5 43 C 67.5 27, 35.5 29, 41.5 13"
      fill="none"
      stroke="#F6F1E7"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <circle cx="41.5" cy="13" r="5.5" fill="#E8B04A" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({ size = 28, showWordmark = false, className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <LogoMark size={size} />
    {showWordmark && (
      <span
        className="font-display font-semibold text-ink tracking-tight leading-none"
        style={{ fontSize: Math.round(size * 0.72) }}
      >
        ProdPath
      </span>
    )}
  </span>
);
