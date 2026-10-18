// Shared "go to section" behaviour for the landing page: the scroll rail's circles and the hero's
// down-arrow both use it. The section's top lands just below the sticky navbar (the first section goes
// to the very top). It announces the target first, so the rail can move its dot straight there
// instead of stepping through the sections scrolled past on the way.

export const SECTION_NAV_EVENT = 'landing:section-nav';

export const navbarHeight = () => document.querySelector('header')?.getBoundingClientRect().height ?? 65;

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const goToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const isFirst = el === document.querySelector('[data-milestone]');
  const maxTop = document.documentElement.scrollHeight - window.innerHeight;
  const top = Math.round(Math.min(maxTop, Math.max(0, isFirst ? 0 : el.getBoundingClientRect().top + window.scrollY - navbarHeight())));
  window.dispatchEvent(new CustomEvent(SECTION_NAV_EVENT, { detail: { id, top } }));
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};
