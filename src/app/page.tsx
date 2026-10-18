import React from 'react';
import weeksData from '@/data/weeks.json';
import caseStudiesData from '@/data/caseStudies.json';
import liveSessionsData from '@/data/liveSessions.json';
import type { Week, ResourceType } from '@/types/curriculum';
import { GoogleSignInButton, SignedInRedirect } from '@/components/landing/GoogleSignIn';
import { HeroScene } from '@/components/landing/HeroScene';
import {
  Compass,
  MiniFlag,
  CoffeeMug,
  NoteCard,
  Rocket,
  BookIcon,
  SearchDocIcon,
  PlayScreenIcon,
  HeatGridIcon,
} from '@/components/landing/Illustrations';
import { GlowCard } from '@/components/GlowCard';
import { ScrollTrail } from '@/components/landing/ScrollTrail';
import { HERO_ICONS, PATH_ICONS, DAY_ICONS, FEATURE_ICONS } from '@/components/decor/iconLayouts';
import { SampleDay } from '@/components/landing/SampleDay';
import {
  Reveal,
  RevealItem,
  CountUp,
  InViewPause,
  IconField,
  ActivityWave,
  FrameworkFigure,
  CtaSummit,
} from '@/components/landing/Motion';

// Everything below is computed from the data files at build time, so the page updates when they change
const weeks = (weeksData as { weeks: Week[] }).weeks;
const caseStudies = caseStudiesData.caseStudies;
const liveSessions = liveSessionsData.liveSessions;

const allResources = weeks.flatMap((w) => w.days.flatMap((d) => d.tasks.flatMap((t) => t.resources)));
const totalDays = weeks.reduce((sum, w) => sum + w.days.length, 0);
// "Week 1: PM Foundations" -> "PM Foundations"
const weekName = (w: Week) => w.title.replace(/^Week\s*\d+\s*[:\-–]\s*/i, '');
// The AI PM track is the final week of the path
const isAiTrack = (index: number) => index === weeks.length - 1;

const sampleWeek = weeks[0];
const sampleDay = sampleWeek?.days[0];

const typeLabel: Record<ResourceType, string> = {
  article: 'Article',
  video: 'Video',
  playlist: 'Playlist',
  'case-study': 'Case study',
};

// Fixed illustrative pattern for the sample activity grid (7 rows x 20 columns), denser towards the right
const ACTIVITY_COLS = 20;
const activityLevels = Array.from({ length: 7 * ACTIVITY_COLS }, (_, i) => {
  const row = i % 7;
  const col = Math.floor(i / 7);
  const noise = ((col * 73 + row * 151 + col * row * 17) % 97) / 97;
  const value = noise * 0.75 + (col / ACTIVITY_COLS) * 0.4;
  if (value > 0.92) return 4;
  if (value > 0.8) return 3;
  if (value > 0.66) return 2;
  if (value > 0.5) return 1;
  return 0;
});
const activityShade = [
  'bg-paper border border-line',
  'bg-accent-soft',
  'bg-accent/50',
  'bg-accent dark:bg-accent/75',
  'bg-[#9E4524] dark:bg-accent',
];

// PM terms for the marquee band
const TERMS = [
  'RICE',
  'North Star metric',
  'A/B testing',
  'Product-market fit',
  'Go-to-market',
  'User stories',
  'Funnels',
  'Retention',
  'Guesstimates',
  'MVP',
  'Prioritization',
];

const SmallLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs font-semibold uppercase tracking-[0.12em] text-muted ${className}`}>{children}</p>
);

// Full-width background band; the content inside stays in the normal page column
const BAND = 'relative mx-[calc(50%-50vw)]';
const BAND_INNER = 'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

const FeatureHeading: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-3 text-accent-dark">
    {icon}
    <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em]">{children}</h3>
  </div>
);

const FEATURE_ICON = 'w-11 h-11 flex-shrink-0';

export default function LandingPage() {
  return (
    <>
    {/* Outside the fading wrapper: a transformed parent would stop "fixed" from pinning it to the screen */}
    <ScrollTrail />
    <div className="animate-fade-in">
      <SignedInRedirect />

      {/* Hero */}
      <section data-milestone="Start" data-icon-scope className={`${BAND} -mt-8 overflow-hidden`}>
        <IconField icons={HERO_ICONS} />
        <div className={`${BAND_INNER} grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-10 items-center pt-12 pb-14 sm:pt-[4.5rem] sm:pb-20`}>
          <div className="max-w-3xl">
            <h1 className="text-[2.35rem] leading-[1.08] sm:text-[3.25rem] lg:text-[2.9rem] xl:text-[3.6rem] font-display font-semibold tracking-tight text-ink text-balance">
              Learn product management <span className="text-accent-dark">the way it&rsquo;s actually practiced.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed">
              Five weeks of structured PM learning, with an AI track. Free.
            </p>
            <div className="mt-8 space-y-4">
              <GoogleSignInButton className="w-full sm:w-auto" />
              <p className="text-sm text-muted">
                {weeks.length} weeks &middot; {totalDays} days &middot; {allResources.length} resources
              </p>
            </div>
          </div>

          <HeroScene className="w-full max-w-[680px] mx-auto lg:max-w-none" />
        </div>
      </section>

      {/* PM terms marquee, directly under the hero: pauses on hover, off-screen and with reduced motion */}
      <section aria-label="PM topics" className={`${BAND} band-2 border-t border-line overflow-hidden`}>
        <InViewPause className="marquee overflow-hidden py-3.5 mr-2 xl:mr-[calc(max(0px,(100vw-1280px)/2)+3.5rem)]">
          <div className="marquee-track flex w-max">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined} className="flex items-center shrink-0">
                {TERMS.map((term) => (
                  <li key={term} className="flex items-center">
                    <span className="px-5 text-sm font-medium text-ink whitespace-nowrap">{term}</span>
                    <svg aria-hidden="true" focusable="false" viewBox="-10 -10 20 20" className="w-3 h-3 flex-shrink-0">
                      <path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" className="fill-marigold" />
                    </svg>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </InViewPause>
      </section>

      {/* The path, week by week */}
      <section aria-labelledby="path-heading" data-milestone="The path" data-icon-scope className={`${BAND} band-2 border-t border-line`}>
        <IconField icons={PATH_ICONS} />
        <div className={`${BAND_INNER} grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-16 pt-14 pb-16 sm:pt-20 sm:pb-24`}>
          <Reveal className="relative">
            <SmallLabel>The curriculum</SmallLabel>
            <h2 id="path-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
              Your {weeks.length}-week path
            </h2>
            <Compass className="hidden lg:block mt-10 ml-1 w-24" />
          </Reveal>

          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-12 items-start">
            <ol className="relative">
              {/* The trail line */}
              <span aria-hidden="true" className="absolute left-[7px] top-3 bottom-3 w-px bg-line" />
              {weeks.map((week, i) => {
                const ai = isAiTrack(i);
                return (
                  <RevealItem key={week.id} index={i} className={`relative pl-10 ${i < weeks.length - 1 ? 'pb-10' : ''}`}>
                    <span
                      aria-hidden="true"
                      className={`absolute rounded-full border-[1.5px] ${
                        ai
                          ? 'left-[-2px] top-[18px] w-[19px] h-[19px] bg-marigold border-ink'
                          : i === 0
                          ? 'left-0 top-[6px] w-[15px] h-[15px] bg-accent border-accent'
                          : 'left-0 top-[6px] w-[15px] h-[15px] bg-paper border-ink'
                      }`}
                    />
                    <div className={ai ? 'relative rounded-card border border-ink/80 bg-surface p-5 sm:p-6' : ''}>
                      {ai && <MiniFlag className="absolute -top-8 right-5 w-8" />}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-dark">Week {i + 1}</span>
                        {ai && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-marigold text-[#1F2430]">
                              AI PM track
                            </span>
                            {/* Hand-drawn sparkle */}
                            <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className="w-4 h-4 -mt-3 text-marigold">
                              <path
                                d="M10.3 2.2 C 10 6, 9.6 13, 9.8 17.6 M 2.4 9.6 C 7 10.2, 13 9.6, 17.5 10.1 M 4.6 4.4 C 7.4 7.4, 12.2 12.6, 15 15.4 M 15.2 4.8 C 12.4 7.6, 8 12.2, 4.9 15.3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <h3 className={`mt-1.5 font-display font-semibold text-ink ${ai ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                        {weekName(week)}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{week.days.length} days</p>
                    </div>
                  </RevealItem>
                );
              })}
            </ol>

            {/* Beside the list on wide screens: a product roadmap and a user journey */}
            <div className="hidden xl:block space-y-8 pt-1">
              <FrameworkFigure kind="roadmap" />
              <FrameworkFigure kind="journey" />
            </div>
          </div>
        </div>
      </section>

      {/* A sample day */}
      {sampleDay && (
        <section aria-labelledby="day-heading" data-milestone="A day" data-icon-scope className={`${BAND} border-t border-line`}>
          <IconField icons={DAY_ICONS} />
          <div className={`${BAND_INNER} grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-16 items-start pt-14 pb-16 sm:pt-20 sm:pb-24`}>
            <Reveal className="relative">
              <SmallLabel>How it works</SmallLabel>
              <h2 id="day-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
                A day on ProdPath
              </h2>
              <NoteCard className="hidden lg:block mt-10 w-24" />
            </Reveal>

            <Reveal delay={0.1}>
              <figure className="relative max-w-2xl">
                {/* Beside the card, only where there is room for it */}
                <CoffeeMug className="hidden xl:block absolute left-[calc(100%+2.5rem)] bottom-16 w-24" />
                <SampleDay
                  dayNumber={sampleDay.day}
                  brief={sampleDay.brief}
                  tasks={sampleDay.tasks.map((task) => ({
                    label: task.label,
                    resources: task.resources.map((res) => ({ id: res.id, title: res.title, typeLabel: typeLabel[res.type] })),
                  }))}
                />
                <figcaption className="mt-3 text-sm text-muted">
                  Check things off, and your progress syncs across devices.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>
      )}

      {/* Everything in one place */}
      <section aria-labelledby="features-heading" data-milestone="Inside" data-icon-scope className={`${BAND} band-2 border-t border-line`}>
        <IconField icons={FEATURE_ICONS} />
        <div className={`${BAND_INNER} pt-14 pb-16 sm:pt-20 sm:pb-24`}>
          <Rocket className="hidden md:block absolute right-4 sm:right-6 lg:right-10 top-12 sm:top-14 w-[4.5rem]" />
          <Reveal>
            <SmallLabel>What&apos;s inside</SmallLabel>
            <h2 id="features-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
              Everything in one place
            </h2>
          </Reveal>

          {/* Two rows: curriculum + case studies, then masterclasses + progress */}
          <Reveal delay={0.1} className="mt-10 grid gap-4 md:grid-cols-3">
            <GlowCard className="md:col-span-2 rounded-card border border-line bg-surface p-6 sm:p-8">
              <FeatureHeading icon={<BookIcon className={FEATURE_ICON} />}>The curriculum</FeatureHeading>
              <p className="mt-6 font-display font-semibold text-ink leading-none">
                <span className="text-6xl sm:text-7xl tabular-nums">
                  <CountUp value={allResources.length} />
                </span>
                <span className="ml-3 text-2xl sm:text-3xl">resources</span>
              </p>
              <p className="mt-4 text-muted">A daily path, Week 1 to Week {weeks.length}</p>
            </GlowCard>

            <GlowCard className="rounded-card border border-line bg-paper p-6 sm:p-8">
              <FeatureHeading icon={<SearchDocIcon className={FEATURE_ICON} />}>Case Studies</FeatureHeading>
              <p className="mt-6 font-display text-6xl font-semibold text-ink leading-none tabular-nums">
                <CountUp value={caseStudies.length} />
              </p>
              <p className="mt-4 text-muted">Real product teardowns</p>
            </GlowCard>

            <GlowCard className="rounded-card border border-line bg-paper p-6 sm:p-8">
              <FeatureHeading icon={<PlayScreenIcon className={FEATURE_ICON} />}>Speaker Masterclasses</FeatureHeading>
              <p className="mt-6 font-display text-6xl font-semibold text-ink leading-none tabular-nums">
                <CountUp value={liveSessions.length} />
              </p>
              <p className="mt-4 text-muted">Talks from PM leaders</p>
            </GlowCard>

            <GlowCard className="md:col-span-2 rounded-card border border-line bg-surface p-6 sm:p-8 grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-6 lg:gap-8 items-center">
              <div>
                <FeatureHeading icon={<HeatGridIcon className={FEATURE_ICON} />}>Progress tracking</FeatureHeading>
                <p className="mt-4 text-muted">Streaks and a heat map</p>
              </div>
              <figure className="w-full max-w-[460px] lg:justify-self-end">
                <ActivityWave
                  className="grid gap-[3px]"
                  style={{ gridTemplateColumns: `repeat(${ACTIVITY_COLS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
                >
                  {activityLevels.map((level, i) => (
                    <span
                      key={i}
                      className={`aspect-square rounded-[2px] ${activityShade[level]}`}
                      style={{ '--col': Math.floor(i / 7), '--row': i % 7 } as React.CSSProperties}
                    />
                  ))}
                </ActivityWave>
                <figcaption className="mt-3 text-xs text-muted">Sample activity</figcaption>
              </figure>
            </GlowCard>
          </Reveal>
        </div>
      </section>

      {/* Final call to action: a full-bleed ink band that sits on the footer */}
      <section
        aria-labelledby="cta-heading"
        data-milestone="Go"
        className={`${BAND} overflow-hidden -mb-8 bg-[#1F2430] border-y border-line text-[#F6F1E7]`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Reveal>
            <h2 id="cta-heading" className="text-3xl sm:text-5xl font-display font-semibold">
              Start with Day 1 today.
            </h2>
            <GoogleSignInButton variant="onDark" className="mt-8 w-full sm:w-auto" />
          </Reveal>
          {/* Summit flag on a small hill, sitting on the bottom edge of the band */}
          <CtaSummit className="hidden lg:block absolute right-8 bottom-0 w-[300px]" />
        </div>
      </section>
    </div>
    </>
  );
}
