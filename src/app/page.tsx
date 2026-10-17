import React from 'react';
import { BookOpen, BookMarked, Video, TrendingUp, Check } from 'lucide-react';
import weeksData from '@/data/weeks.json';
import caseStudiesData from '@/data/caseStudies.json';
import liveSessionsData from '@/data/liveSessions.json';
import type { Week, ResourceType } from '@/types/curriculum';
import { GoogleSignInButton, ReturningLearnerLink, SignedInRedirect } from '@/components/landing/GoogleSignIn';
import { TrailMap } from '@/components/landing/TrailMap';

// Everything below is computed from the data files at build time, so the page updates when they change
const weeks = (weeksData as { weeks: Week[] }).weeks;
const caseStudies = caseStudiesData.caseStudies;
const liveSessions = liveSessionsData.liveSessions;

const allResources = weeks.flatMap((w) => w.days.flatMap((d) => d.tasks.flatMap((t) => t.resources)));
const totalDays = weeks.reduce((sum, w) => sum + w.days.length, 0);
const countByType = (type: ResourceType) => allResources.filter((r) => r.type === type).length;
const resourceMix = [
  { label: 'Videos', count: countByType('video'), className: 'bg-accent' },
  { label: 'Articles', count: countByType('article'), className: 'bg-ink' },
  { label: 'Playlists', count: countByType('playlist'), className: 'bg-marigold' },
  { label: 'Case studies', count: countByType('case-study'), className: 'bg-accent-soft' },
].filter((m) => m.count > 0);

const weekResourceCount = (w: Week) => w.days.reduce((s, d) => s + d.tasks.reduce((t, task) => t + task.resources.length, 0), 0);
// "Week 1: PM Foundations" -> "PM Foundations"
const weekName = (w: Week) => w.title.replace(/^Week\s*\d+\s*[:\-–]\s*/i, '');
const isAiTrack = (w: Week) => /AI Product Management/i.test(w.title);

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

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      <SignedInRedirect />

      {/* Hero */}
      <section className="grid md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_360px] gap-10 lg:gap-16 items-center pt-4 pb-16 sm:pt-10 sm:pb-24">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-muted">Free {weeks.length}-week product management path</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-ink">
            Become a product manager, <span className="text-accent-dark">one small step a day.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted leading-relaxed max-w-[44rem]">
            A structured path through PM foundations, metrics, tech, interview prep and AI product management. Free, and your progress saves across devices.
          </p>
          <div className="mt-8 space-y-4">
            <GoogleSignInButton className="w-full sm:w-auto" />
            <ReturningLearnerLink />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto md:max-w-none">
          <TrailMap weekCount={weeks.length} dayCount={totalDays} resourceCount={allResources.length} />
        </div>
      </section>

      {/* The path, week by week */}
      <section aria-labelledby="path-heading" className="reveal border-t border-line pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10 lg:gap-16">
          <div>
            <SmallLabel>The curriculum</SmallLabel>
            <h2 id="path-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
              Your {weeks.length}-week path
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              {totalDays} days of reading, watching and practising, in order. Each day builds on the one before.
            </p>
          </div>

          <ol className="relative">
            {/* The trail line */}
            <span aria-hidden="true" className="absolute left-[7px] top-3 bottom-3 w-px bg-line" />
            {weeks.map((week, i) => {
              const ai = isAiTrack(week);
              const remaining = week.days.length - 3;
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
                  <div
                    className={`grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-x-8 gap-y-3 ${
                      ai ? 'rounded-card border border-ink/80 bg-surface p-5 sm:p-6' : ''
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-dark">Week {i + 1}</span>
                        {ai && (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded bg-marigold text-[#1F2430]">
                            AI PM track
                          </span>
                        )}
                      </div>
                      <h3 className={`mt-1.5 font-display font-semibold text-ink ${ai ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                        {weekName(week)}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {week.days.length} days &middot; {weekResourceCount(week)} resources
                      </p>
                    </div>
                    <ul className="space-y-1.5 text-sm text-ink/90 sm:pt-6">
                      {week.days.slice(0, 3).map((day) => (
                        <li key={day.day} className="flex gap-3">
                          <span className="w-12 flex-shrink-0 text-muted tabular-nums">Day {day.day}</span>
                          <span>{day.brief}</span>
                        </li>
                      ))}
                      {remaining > 0 && (
                        <li className="pl-[3.75rem] text-muted">
                          and {remaining} more {remaining === 1 ? 'day' : 'days'}
                        </li>
                      )}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* A sample day */}
      {sampleDay && (
        <section aria-labelledby="day-heading" className="reveal border-t border-line pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-start">
            <div className="lg:order-2">
              <SmallLabel>How it works</SmallLabel>
              <h2 id="day-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
                A day on ProdPath
              </h2>
              <ol className="mt-8 space-y-6">
                {[
                  ["Do today's resources", 'Articles, videos and case studies, picked and put in order for you.'],
                  ['Check them off', 'Tick each one as you finish and watch your progress fill in.'],
                  ['Pick up on any device', 'Your progress saves to your account, right where you left off.'],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-5">
                    <span className="font-display text-3xl font-semibold leading-none text-accent-dark w-6 flex-shrink-0" aria-hidden="true">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-sans font-semibold text-ink tracking-normal">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <figure className="lg:order-1">
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
                              <span
                                aria-hidden="true"
                                className={`mt-0.5 w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center flex-shrink-0 ${
                                  done ? 'bg-accent border-accent text-paper' : 'border-ink/50 bg-surface'
                                }`}
                              >
                                {done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
                Sample from Week 1 - sign in to start checking things off.
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* Everything in one place */}
      <section aria-labelledby="features-heading" className="reveal border-t border-line pt-14 pb-16 sm:pt-20 sm:pb-24">
        <SmallLabel>What&apos;s inside</SmallLabel>
        <h2 id="features-heading" className="mt-3 text-3xl sm:text-4xl font-display font-semibold text-ink">
          Everything in one place
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {/* Curriculum: the large block */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-card border border-line bg-surface p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 text-accent-dark">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em]">The curriculum</h3>
            </div>
            <p className="mt-6 font-display font-semibold text-ink leading-none">
              <span className="text-6xl sm:text-7xl">{allResources.length}</span>
              <span className="ml-3 text-2xl sm:text-3xl">resources</span>
            </p>
            <p className="mt-4 max-w-md text-muted leading-relaxed">
              Hand-picked articles, videos and playlists, arranged into {totalDays} days across {weeks.length} weeks, so you always know what to do next.
            </p>

            <div className="mt-auto pt-10">
              <div className="flex h-3 rounded-sm overflow-hidden border border-line" aria-hidden="true">
                {resourceMix.map((m) => (
                  <span key={m.label} className={m.className} style={{ width: `${(m.count / allResources.length) * 100}%` }} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {resourceMix.map((m) => (
                  <li key={m.label} className="flex items-center gap-2">
                    <span aria-hidden="true" className={`w-2.5 h-2.5 rounded-sm border border-line ${m.className}`} />
                    <span>
                      <span className="font-semibold text-ink tabular-nums">{m.count}</span> {m.label.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Case studies */}
          <div className="rounded-card border border-line bg-surface p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-ink">Case Studies</h3>
              <BookMarked className="w-5 h-5 text-accent-dark flex-shrink-0" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-ink">{caseStudies.length}</span> strategy teardowns with key takeaways
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink/90 border-t border-line pt-4">
              {caseStudies.slice(0, 3).map((cs) => (
                <li key={cs.id} className="truncate">{cs.title}</li>
              ))}
            </ul>
          </div>

          {/* Speaker masterclasses */}
          <div className="rounded-card border border-line bg-paper p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-ink">Speaker Masterclasses</h3>
              <Video className="w-5 h-5 text-accent-dark flex-shrink-0" aria-hidden="true" />
            </div>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-ink">{liveSessions.length}</span> recorded sessions with product leaders
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink/90 border-t border-line pt-4">
              {liveSessions.slice(0, 3).map((s) => (
                <li key={s.sessionNumber} className="truncate">{s.topic}</li>
              ))}
            </ul>
          </div>

          {/* Progress tracking */}
          <div className="lg:col-span-3 rounded-card border border-line bg-surface p-6 sm:p-8 grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-accent-dark">
                <TrendingUp className="w-5 h-5" aria-hidden="true" />
                <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.12em]">Progress tracking</h3>
              </div>
              <p className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-ink leading-snug">
                See every day you showed up.
              </p>
              <p className="mt-3 text-muted leading-relaxed">
                Each resource you check off is saved with the date, and syncs to your account on every device.
              </p>
            </div>
            <figure className="w-full max-w-[460px] md:justify-self-end">
              <div
                aria-hidden="true"
                className="grid gap-[3px]"
                style={{ gridTemplateColumns: `repeat(${ACTIVITY_COLS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
              >
                {activityLevels.map((level, i) => (
                  <span key={i} className={`aspect-square rounded-[2px] ${activityShade[level]}`} />
                ))}
              </div>
              <figcaption className="mt-3 text-xs text-muted">
                Sample activity - your own heat map fills in as you learn.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Final call to action: a full-bleed ink band that sits on the footer */}
      <section
        aria-labelledby="cta-heading"
        className="mx-[calc(50%-50vw)] -mb-8 bg-[#1F2430] border-y border-line text-[#F6F1E7]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 id="cta-heading" className="text-3xl sm:text-5xl font-display font-semibold">
              Start with Day 1 today.
            </h2>
            <p className="mt-3 text-[#F6F1E7]/80">
              Free, no setup. Sign in and your first day is ready.
            </p>
          </div>
          <GoogleSignInButton variant="onDark" className="w-full sm:w-auto flex-shrink-0" />
        </div>
      </section>
    </div>
  );
}
