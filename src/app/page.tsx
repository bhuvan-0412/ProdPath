import React from 'react';
import { BookOpen, BookMarked, Video, TrendingUp, Check } from 'lucide-react';
import weeksData from '@/data/weeks.json';
import caseStudiesData from '@/data/caseStudies.json';
import liveSessionsData from '@/data/liveSessions.json';
import type { Week, ResourceType } from '@/types/curriculum';
import { GoogleSignInButton, SignedInRedirect } from '@/components/landing/GoogleSignIn';
import { TrailMap } from '@/components/landing/TrailMap';
import { ContourLines } from '@/components/ContourLines';
import { GlowCard } from '@/components/GlowCard';
import { TrailSegment, NotebookDots, Doodle } from '@/components/landing/PageDecor';

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
const sampleResources = sampleDay ? sampleDay.tasks.flatMap((t) => t.resources) : [];

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

const SmallLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs font-semibold uppercase tracking-[0.12em] text-muted ${className}`}>{children}</p>
);

// Full-width background band; the content inside stays in the normal page column
const BAND = 'relative mx-[calc(50%-50vw)]';
const BAND_INNER = 'relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

const FeatureHeading: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 text-accent-dark">
    {icon}
    <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em]">{children}</h3>
  </div>
);

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      <SignedInRedirect />

      {/* Hero */}
      <section className={`${BAND} -mt-8 overflow-hidden`}>
        <ContourLines className="right-0 bottom-0 w-[150%] sm:w-full md:w-[78%] max-w-[1100px] h-auto" />
        <TrailSegment start bottom="a" />
        <div className={`${BAND_INNER} grid md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-16 items-center pt-12 pb-16 sm:pt-[4.5rem] sm:pb-24`}>
        <div className="max-w-3xl">
          <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-ink text-balance">
            Become a product manager, <span className="text-accent-dark">one small step a day.</span>
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

        <div className="w-full max-w-sm mx-auto md:max-w-none">
          <TrailMap weekCount={weeks.length} />
        </div>
        </div>
      </section>

      {/* The path, week by week */}
      <section aria-labelledby="path-heading" className={`${BAND} band-2 border-t border-line`}>
        <ContourLines set="bottomLeft" className="left-0 bottom-0 w-[70%] sm:w-[52%] lg:w-[38%] max-w-[560px] h-auto" />
        <TrailSegment top="b" bottom="c" />
        <div className={`${BAND_INNER} reveal grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-16 pt-14 pb-16 sm:pt-20 sm:pb-24`}>
          <div className="relative">
            <SmallLabel>The curriculum</SmallLabel>
            <h2 id="path-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
              Your {weeks.length}-week path
            </h2>
            <Doodle kind="check" className="left-1 top-36 w-9 text-accent" />
          </div>

          <ol className="relative">
            {/* The trail line */}
            <span aria-hidden="true" className="absolute left-[7px] top-3 bottom-3 w-px bg-line" />
            {weeks.map((week, i) => {
              const ai = isAiTrack(i);
              return (
                <li key={week.id} className={`relative pl-10 ${i < weeks.length - 1 ? 'pb-10' : ''}`}>
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
                  <div className={ai ? 'rounded-card border border-ink/80 bg-surface p-5 sm:p-6' : ''}>
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
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* A sample day */}
      {sampleDay && (
        <section aria-labelledby="day-heading" className={`${BAND} border-t border-line`}>
          <NotebookDots />
          <ContourLines set="rightEdge" className="right-0 top-1/2 -translate-y-1/2 h-[92%] w-auto max-w-[40%] sm:max-w-none" />
          <TrailSegment top="d" bottom="a" />
          <div className={`${BAND_INNER} reveal grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-16 items-start pt-14 pb-16 sm:pt-20 sm:pb-24`}>
            <div className="relative">
              <SmallLabel>How it works</SmallLabel>
              <h2 id="day-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
                A day on ProdPath
              </h2>
              <Doodle kind="arrow" className="left-28 top-[8.5rem] w-16 text-accent" />
            </div>

            <figure className="max-w-2xl">
              <div className="rounded-card border border-line bg-surface">
                <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-dark">
                      Week 1 &middot; Day {sampleDay.day}
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-ink">{sampleDay.brief}</p>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap pt-0.5">
                    1 of {sampleResources.length} done
                  </span>
                </div>
                <div className="h-1 bg-paper" aria-hidden="true">
                  <div className="h-full bg-accent" style={{ width: `${100 / Math.max(sampleResources.length, 1)}%` }} />
                </div>
                <div className="p-5 space-y-5">
                  {sampleDay.tasks.map((task) => (
                    <div key={task.label}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-2">{task.label}</p>
                      <ul className="space-y-2">
                        {task.resources.map((res) => {
                          const done = res.id === sampleResources[0]?.id;
                          return (
                            <li key={res.id} className="flex items-start gap-3 p-3 rounded-lg border border-line bg-paper/60">
                              <span aria-hidden="true" className="relative mt-0.5 flex-shrink-0">
                                <span
                                  className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center ${
                                    done ? 'bg-accent border-accent text-paper' : 'border-ink/50 bg-surface'
                                  }`}
                                >
                                  {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </span>
                                {/* Hand-drawn loop around the ticked box */}
                                {done && (
                                  <svg
                                    viewBox="0 0 40 40"
                                    focusable="false"
                                    className="pointer-events-none absolute -left-[8px] -top-[8px] w-[36px] h-[36px] text-accent"
                                  >
                                    <path
                                      d="M26.5 5.5 C 17 2.8, 5.6 7.6, 4.6 18.4 C 3.7 28.8, 12.4 36.2, 21.8 35.2 C 31.6 34.2, 36.8 26.4, 35.4 17 C 34.4 10.6, 29.4 6.4, 20.4 6.8"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className={`block text-sm font-medium ${done ? 'text-muted line-through' : 'text-ink'}`}>
                                  {res.title}
                                  {done && <span className="sr-only"> (done)</span>}
                                </span>
                                <span className="block text-xs text-muted mt-0.5">{typeLabel[res.type]}</span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <figcaption className="mt-3 text-sm text-muted">
                Check things off, and your progress syncs across devices.
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* Everything in one place */}
      <section aria-labelledby="features-heading" className={`${BAND} band-2 border-t border-line`}>
        <ContourLines set="wideMound" className="left-0 bottom-0 w-[95%] sm:w-[75%] lg:w-[55%] max-w-[820px] h-auto" />
        <TrailSegment top="b" bottom="end" />
        <div className={`${BAND_INNER} reveal pt-14 pb-16 sm:pt-20 sm:pb-24`}>
        <Doodle kind="star" className="right-8 top-16 sm:top-[5.5rem] w-7 text-marigold" />
        <SmallLabel>What&apos;s inside</SmallLabel>
        <h2 id="features-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
          Everything in one place
        </h2>

        {/* Two rows: curriculum + case studies, then masterclasses + progress */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <GlowCard className="md:col-span-2 rounded-card border border-line bg-surface p-6 sm:p-8">
            <FeatureHeading icon={<BookOpen className="w-5 h-5" aria-hidden="true" />}>The curriculum</FeatureHeading>
            <p className="mt-6 font-display font-semibold text-ink leading-none">
              <span className="text-6xl sm:text-7xl">{allResources.length}</span>
              <span className="ml-3 text-2xl sm:text-3xl">resources</span>
            </p>
            <p className="mt-4 text-muted">A daily path, Week 1 to Week {weeks.length}</p>
          </GlowCard>

          <GlowCard className="rounded-card border border-line bg-paper p-6 sm:p-8">
            <FeatureHeading icon={<BookMarked className="w-5 h-5" aria-hidden="true" />}>Case Studies</FeatureHeading>
            <p className="mt-6 font-display text-6xl font-semibold text-ink leading-none">{caseStudies.length}</p>
            <p className="mt-4 text-muted">Real product teardowns</p>
          </GlowCard>

          <GlowCard className="rounded-card border border-line bg-paper p-6 sm:p-8">
            <FeatureHeading icon={<Video className="w-5 h-5" aria-hidden="true" />}>Speaker Masterclasses</FeatureHeading>
            <p className="mt-6 font-display text-6xl font-semibold text-ink leading-none">{liveSessions.length}</p>
            <p className="mt-4 text-muted">Talks from PM leaders</p>
          </GlowCard>

          <GlowCard className="md:col-span-2 rounded-card border border-line bg-surface p-6 sm:p-8 grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-6 lg:gap-8 items-center">
            <div>
              <FeatureHeading icon={<TrendingUp className="w-5 h-5" aria-hidden="true" />}>Progress tracking</FeatureHeading>
              <p className="mt-4 text-muted">Streaks and a heat map</p>
            </div>
            <figure className="w-full max-w-[460px] lg:justify-self-end">
              <div
                aria-hidden="true"
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${ACTIVITY_COLS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
              >
                {activityLevels.map((level, i) => (
                  <span key={i} className={`aspect-square rounded-[2px] ${activityShade[level]}`} />
                ))}
              </div>
              <figcaption className="mt-3 text-xs text-muted">Sample activity</figcaption>
            </figure>
          </GlowCard>
        </div>
        </div>
      </section>

      {/* Final call to action: a full-bleed ink band that sits on the footer */}
      <section
        aria-labelledby="cta-heading"
        className={`${BAND} overflow-hidden -mb-8 bg-[#1F2430] border-y border-line text-[#F6F1E7]`}
      >
        <ContourLines tone="cream" className="right-0 bottom-0 w-[160%] sm:w-full md:w-[70%] max-w-[1000px] h-auto" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <h2 id="cta-heading" className="text-3xl sm:text-5xl font-display font-semibold">
            Start with Day 1 today.
          </h2>
          <GoogleSignInButton variant="onDark" className="w-full sm:w-auto flex-shrink-0" />
        </div>
      </section>
    </div>
  );
}
