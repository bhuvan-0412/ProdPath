// Shared section positions for the landing page: the scroll rail and the hero's down-arrow both use them.
// A section's anchor is the scroll position where its top sits just below the sticky navbar. The first
// section's anchor is the top of the page, and the last one's is the very bottom (the final band and the
// footer are shorter than the screen, so its top can never reach the navbar).

export const navbarHeight = () => document.querySelector('header')?.getBoundingClientRect().height ?? 65;

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Sections that take part: data-milestone="Name" plus an id, in page order */
export const landingSections = () => [...document.querySelectorAll<HTMLElement>('[data-milestone]')].filter((el) => el.id);

export const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

/** Anchor scroll positions, never decreasing down the page */
export const sectionAnchors = (sections: HTMLElement[]) => {
  const max = maxScroll();
  const nav = navbarHeight();
  let prev = 0;
  return sections.map((el, i) => {
    const raw = i === 0 ? 0 : i === sections.length - 1 ? max : el.getBoundingClientRect().top + window.scrollY - nav;
    prev = Math.max(prev, Math.round(Math.min(max, Math.max(0, raw))));
    return prev;
  });
};

/** Scroll to a section's anchor: smooth, or instant with reduced motion */
export const goToSection = (id: string) => {
  const sections = landingSections();
  const index = sections.findIndex((el) => el.id === id);
  if (index < 0) return;
  const top = sectionAnchors(sections)[index];
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};
