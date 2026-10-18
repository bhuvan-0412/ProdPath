'use client';

import React, { useEffect, useState } from 'react';
import { goToSection } from './sectionNav';

// Down-arrow at the bottom of the full-screen hero (desktops and laptops only: see .hero-cue in
// globals.css). Clicking it scrolls to the section with targetId, the same way the section navigator
// does (its top lands just below the navbar). It fades out once the page has
// scrolled a little, and its slow bounce is off under prefers-reduced-motion.

const HIDE_AFTER = 40; // px scrolled

export const ScrollCue: React.FC<{ targetId: string }> = ({ targetId }) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > HIDE_AFTER);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => goToSection(targetId)}
      aria-label="Scroll to the curriculum"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`hero-cue absolute left-1/2 bottom-3 z-10 -translate-x-1/2 items-center justify-center w-11 h-11 rounded-full text-ink/60 hover:text-ink focus-visible:text-ink transition-opacity duration-300 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <svg viewBox="0 0 24 24" className="hero-cue-arrow w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
};
