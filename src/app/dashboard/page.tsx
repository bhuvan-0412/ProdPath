'use client';

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import { ResourceCard } from '@/components/ResourceCard';
import BorderGlow from '@/components/BorderGlow';
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
  const { getOverallStats, getWeekStats, getLiveSessionStats, getCaseStudyStats, getNextIncompleteResource, resetProgress } = useProgress();
  const overall = getOverallStats();
  const liveStats = getLiveSessionStats();
  const caseStats = getCaseStudyStats();
  const nextUp = getNextIncompleteResource();

  const heroHref = nextUp
    ? (nextUp.weekId ? `/course?expanded=${nextUp.weekId}&targetRes=${nextUp.id}` : '/course')
    : '/course';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner with Signature Glass & BorderGlow */}
      <Link href={heroHref} className="group block cursor-pointer transition-all duration-300">
        <BorderGlow
          edgeSensitivity={35}
          glowColor="270 85 65"
          backgroundColor="rgba(18, 18, 26, 0.95)"
          borderRadius={24}
          glowRadius={35}
          glowIntensity={1.2}
          coneSpread={30}
          animated={true}
          colors={['#8b5cf6', '#a78bfa', '#6366f1']}
          className="shadow-xl group-hover:shadow-2xl group-hover:shadow-violet-500/10 transition-all duration-300"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-purple-950/40 to-zinc-950 border border-violet-500/20 group-hover:border-violet-400/40 group-hover:bg-purple-950/50 p-6 sm:p-8 text-white transition-all duration-300">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/25 transition-all duration-300" />
            <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white group-hover:text-violet-100 transition-colors">
                  Master Product Management in 5 Weeks
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-violet-300/70 group-hover:text-violet-300 transition-colors bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                  <span>Resume Learning</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Overall Progress Widget */}
              <div className="pt-2">
                <div className="bg-zinc-950/70 backdrop-blur-md rounded-2xl p-5 border border-violet-500/25 group-hover:border-violet-500/40 space-y-3 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono font-bold tracking-wide text-violet-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                      Overall Curriculum Progress
                    </span>
                    <span className="text-2xl font-mono font-black text-white">{overall.percentage}%</span>
                  </div>
                  <ProgressBar
                    percentage={overall.percentage}
                    completed={overall.completed}
                    total={overall.total}
                    showLabel={false}
                    size="lg"
                  />
                  <div className="flex justify-between items-center text-xs font-mono text-zinc-400 pt-1">
                    <span>{overall.completed} completed of {overall.total} total items</span>
                    <span>{overall.total - overall.completed} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderGlow>
      </Link>

      {/* "Continue Where I Left Off" Signature Surface Card */}
      {nextUp ? (
        <div className="glass-signature rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-zinc-900 dark:text-zinc-100">
                  Continue Where You Left Off
                </h2>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  Next up in your curriculum sequence
                </p>
              </div>
            </div>
            <Link
              href="/course"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View full curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ResourceCard resource={nextUp} showWeekBadge={true} />
        </div>
      ) : (
        <div className="bg-violet-950/20 rounded-2xl p-6 border border-violet-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-violet-100">
              Congratulations! You&apos;ve completed all curriculum resources!
            </h2>
            <p className="text-xs text-violet-300/80 mt-1">
              Add custom resources in the Resource Library or review case studies and masterclasses.
            </p>
          </div>
        </div>
      )}



      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <Link
          href="/course"
          className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Curriculum View
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Structured Day-by-Day topics and task lists
            </p>
          </div>
        </Link>

        <Link
          href="/schedule"
          className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Timeline Schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Chronological 4-week program roadmap
            </p>
          </div>
        </Link>

        <Link
          href="/resources"
          className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Case Studies
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Real-world PM strategies & executive takeaways
            </p>
          </div>
        </Link>

        <Link
          href="/live-sessions"
          className="p-5 rounded-2xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 hover:border-violet-500/40 transition-all flex items-center gap-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Live Sessions
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Recorded masterclasses & speaker talks
            </p>
          </div>
        </Link>
      </div>

      {/* Progress Reset Tool */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetProgress}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset completion progress</span>
        </button>
      </div>
    </div>
  );
}
