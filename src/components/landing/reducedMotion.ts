'use client';

import { MotionGlobalConfig } from 'motion/react';

// When the visitor asks for reduced motion, Motion skips every animation and jumps straight to the end
// state (the CSS in globals.css does the same for the stylesheet loops). Follows the setting live.
if (typeof window !== 'undefined' && window.matchMedia) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => {
    MotionGlobalConfig.skipAnimations = query.matches;
  };
  apply();
  query.addEventListener?.('change', apply);
}

export {};
