'use client';

import { useEffect, useState, type RefObject } from 'react';

// Small replacements for Motion's useInView / useReducedMotion, so landing pieces that only need to know
// "is this on screen" don't pull in the animation library. Same rules as Motion's version: `amount` is the
// share of the element that has to be visible before the observer reports, and `once` stops watching after
// the first time it is seen.
export const useInView = (ref: RefObject<Element | null>, { once = false, amount = 0 }: { once?: boolean; amount?: number } = {}) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, amount]);

  return inView;
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
