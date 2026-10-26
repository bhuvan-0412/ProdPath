'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import { ResourceCard } from '@/components/ResourceCard';
import { GlowCard } from '@/components/GlowCard';
import { StickyCheck, MiniFlag } from '@/components/landing/Illustrations';
import weeksData from '@/data/weeks.json';
import caseStudiesData from '@/data/caseStudies.json';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  PlayCircle,
  RotateCcw,
  BookMarked
} from 'lucide-react';
import { PageBackdrop } from '@/components/PageBackdrop';
import { PageIcons } from '@/components/decor/BackgroundIcons';
import { DASHBOARD_ICONS } from '@/components/decor/iconLayouts';

// Live counts for the quick-navigation cards, straight from the data files
const weekCount = weeksData.weeks.length;
const caseStudyCount = caseStudiesData.caseStudies.length;

const QUICK_NAV = [
  { href: '/course', label: 'Curriculum', count: `${weekCount} weeks`, icon: BookOpen },
  { href: '/activity', label: 'Activity', count: null, icon: CalendarDays },
  { href: '/resources', label: 'Case Studies', count: String(caseStudyCount), icon: BookMarked },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, getOverallStats, getNextIncompleteResource, resetProgress } = useProgress();
  const overall = getOverallStats();
  const nextUp = getNextIncompleteResource();
  const finished = overall.total > 0 && overall.completed === overall.total;

  const fullName: string = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const firstName = fullName.trim().split(/\s+/)[0];

  const heroHref = nextUp
    ? (nextUp.weekId ? `/course?expanded=${nextUp.weekId}&targetRes=${nextUp.id}` : '/course')
    : '/course';

  return (
    <>
    <PageBackdrop variant="contours" />
    <PageIcons icons={DASHBOARD_ICONS} />
    <div className="space-y-8 animate-fade-in">
      {/* Welcome card, with a soft circle peeking out from behind it and a sticky note (768px and up) */}
      <div className="relative">
        <span aria-hidden="true" className="hidden md:block absolute -top-7 right-24 w-40 h-40 rounded-full bg-accent-soft" />
        <GlowCard
          as={Link}
          href={heroHref}
          className="group relative block cursor-pointer rounded-xl bg-surface border border-line p-6 sm:p-8 text-ink transition-colors duration-200"
        >
          <div className="grid md:grid-cols-[minmax(0,1fr)_112px] lg:grid-cols-[minmax(0,48rem)_112px] md:justify-between gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink">
                  {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
                </h1>
                <div className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent-dark bg-accent-soft px-3 py-1.5 rounded-full">
                  <span>Resume Learning</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {finished ? (
                <div className="bg-paper rounded-lg p-5 border border-line flex items-center gap-4">
                  <MiniFlag className="w-9 h-11 flex-shrink-0" />
                  <p className="font-display text-xl font-semibold text-ink">You finished the path.</p>
                </div>
              ) : (
                <div className="bg-paper rounded-lg p-5 border border-line space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold tracking-wide text-muted">Progress</span>
                    <span className="text-2xl font-display font-semibold text-ink">{overall.percentage}%</span>
                  </div>
                  <ProgressBar
                    percentage={overall.percentage}
                    completed={overall.completed}
                    total={overall.total}
                    showLabel={false}
                    size="lg"
                  />
                  <p className="text-xs text-muted pt-1 tabular-nums">
                    {overall.completed} of {overall.total}
                  </p>
                </div>
              )}
            </div>

            <StickyCheck className="hidden md:block w-28" />
          </div>
        </GlowCard>
      </div>

      {/* "Continue Where I Left Off" Signature Surface Card (Split Click Zones) */}
      {nextUp && (
        <GlowCard
          onClick={() => router.push(heroHref)}
          className="bg-surface border border-line rounded-xl p-6 cursor-pointer space-y-3.5 transition-colors duration-200 group/hero-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center group-hover/hero-card:scale-105 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-ink group-hover/hero-card:text-accent-dark transition-colors">
                  Up next
                </h2>
              </div>
            </div>
            <Link
              href="/course"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-accent-dark hover:underline inline-flex items-center gap-1 min-h-10 sm:min-h-0"
            >
              <span>View full curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inner Resource Row: Click opens external resource link directly */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (nextUp.url && nextUp.url !== '#') {
                window.open(nextUp.url, '_blank', 'noopener,noreferrer');
              }
            }}
            className="rounded-xl transition-all duration-200 hover:ring-2 hover:ring-accent/50 cursor-pointer"
          >
            <ResourceCard resource={nextUp} showWeekBadge={true} />
          </div>
        </GlowCard>
      )}



      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {QUICK_NAV.map(({ href, label, count, icon: Icon }) => (
          <GlowCard
            key={href}
            as={Link}
            href={href}
            className="p-5 rounded-xl bg-surface border border-line transition-colors flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark transition-colors">
              {label}
              {count && <span className="font-sans font-normal text-muted whitespace-nowrap"> &middot; {count}</span>}
            </h3>
          </GlowCard>
        ))}
      </div>

      {/* Progress Reset Tool */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetProgress}
          className="inline-flex items-center gap-1.5 min-h-10 sm:min-h-0 text-xs text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset completion progress</span>
        </button>
      </div>
    </div>
    </>
  );
}
