'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import { ResourceCard } from '@/components/ResourceCard';
import weeksData from '@/data/weeks.json';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Video,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  BookMarked
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { getOverallStats, getLiveSessionStats, getCaseStudyStats, getNextIncompleteResource, resetProgress } = useProgress();
  const overall = getOverallStats();
  const nextUp = getNextIncompleteResource();

  const heroHref = nextUp
    ? (nextUp.weekId ? `/course?expanded=${nextUp.weekId}&targetRes=${nextUp.id}` : '/course')
    : '/course';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <Link href={heroHref} className="group block cursor-pointer rounded-xl">
        <div className="rounded-xl bg-surface border border-line group-hover:border-ink group-hover:shadow-offset p-6 sm:p-8 text-ink transition-all duration-200">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink">
                Master Product Management in 5 Weeks
              </h1>
              <div className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent-dark bg-accent-soft px-3 py-1.5 rounded-full">
                <span>Resume Learning</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Overall Progress Widget */}
            <div className="pt-2">
              <div className="bg-paper rounded-lg p-5 border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-wide text-muted flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Overall Curriculum Progress
                  </span>
                  <span className="text-2xl font-display font-semibold text-ink">{overall.percentage}%</span>
                </div>
                <ProgressBar
                  percentage={overall.percentage}
                  completed={overall.completed}
                  total={overall.total}
                  showLabel={false}
                  size="lg"
                />
                <div className="flex justify-between items-center text-xs text-muted pt-1">
                  <span>{overall.completed} completed of {overall.total} total items</span>
                  <span>{overall.total - overall.completed} remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* "Continue Where I Left Off" Signature Surface Card (Split Click Zones) */}
      {nextUp ? (
        <div
          onClick={() => router.push(heroHref)}
          className="bg-surface border border-line rounded-xl p-6 hover:shadow-offset hover:border-ink cursor-pointer space-y-3.5 transition-all duration-200 group/hero-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center group-hover/hero-card:scale-105 transition-transform">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-ink group-hover/hero-card:text-accent-dark transition-colors">
                  Continue Where You Left Off
                </h2>
                <p className="text-xs text-muted">
                  Next up in your curriculum sequence
                </p>
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
        </div>
      ) : (
        <div className="bg-accent-soft rounded-xl p-6 border border-accent/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-ink">
              Congratulations! You&apos;ve completed all curriculum resources!
            </h2>
            <p className="text-xs text-accent-dark mt-1">
              Add custom resources in the Resource Library or review case studies and masterclasses.
            </p>
          </div>
        </div>
      )}



      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link
          href="/course"
          className="p-5 rounded-xl bg-surface border border-line hover:border-accent transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark transition-colors">
              Curriculum View
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Structured Day-by-Day topics and task lists
            </p>
          </div>
        </Link>

        <Link
          href="/schedule"
          className="p-5 rounded-xl bg-surface border border-line hover:border-accent transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark transition-colors">
              Timeline Schedule
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Chronological 5-week program roadmap
            </p>
          </div>
        </Link>

        <Link
          href="/resources"
          className="p-5 rounded-xl bg-surface border border-line hover:border-accent transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark transition-colors">
              Case Studies
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Real-world PM strategies & executive takeaways
            </p>
          </div>
        </Link>

        <Link
          href="/live-sessions"
          className="p-5 rounded-xl bg-surface border border-line hover:border-accent transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark transition-colors">
              Live Sessions
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Recorded masterclasses & speaker talks
            </p>
          </div>
        </Link>
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
  );
}
