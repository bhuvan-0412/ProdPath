'use client';

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import { ResourceCard } from '@/components/ResourceCard';
import weeksData from '@/data/weeks.json';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Library,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

export default function DashboardPage() {
  const { getOverallStats, getWeekStats, getNextIncompleteResource, resetProgress } = useProgress();
  const overall = getOverallStats();
  const nextUp = getNextIncompleteResource();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 border border-indigo-700/50 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ProdPath &bull; PM Learning Tracker</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Master Product Management in 4 Weeks
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Track your progress, explore curated articles and videos, and personalize your curriculum with custom resources.
          </p>

          {/* Overall Progress Widget */}
          <div className="pt-2">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Overall Curriculum Progress
                </span>
                <span className="text-2xl font-black text-white">{overall.percentage}%</span>
              </div>
              <ProgressBar
                percentage={overall.percentage}
                completed={overall.completed}
                total={overall.total}
                showLabel={false}
                size="lg"
              />
              <div className="flex justify-between items-center text-xs text-indigo-200/80 pt-1">
                <span>{overall.completed} completed of {overall.total} total items</span>
                <span>{overall.total - overall.completed} remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Continue Where I Left Off" Banner */}
      {nextUp ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Continue Where You Left Off
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Next up in your curriculum sequence
                </p>
              </div>
            </div>
            <Link
              href="/course"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1"
            >
              <span>View full curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ResourceCard resource={nextUp} showWeekBadge={true} />
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Congratulations! You've completed all curriculum resources!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Add your own custom resources in the Resource Library or review past weeks.
            </p>
          </div>
        </div>
      )}

      {/* Per-Week Mini Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Weekly Breakdown
          </h2>
          <Link
            href="/course"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore Weeks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeksData.weeks.map((week) => {
            const stats = getWeekStats(week.id);
            return (
              <Link
                key={week.id}
                href={`/course?expanded=${week.id}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50">
                      {week.id.replace('-', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {stats.completed}/{stats.total}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {week.title.split(': ')[1] || week.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <ProgressBar
                    percentage={stats.percentage}
                    showLabel={false}
                    size="sm"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>{stats.percentage}% complete</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href="/course"
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 hover:border-indigo-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Curriculum View
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured Day-by-Day topics and task lists
            </p>
          </div>
        </Link>

        <Link
          href="/schedule"
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Timeline Schedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological 4-week program roadmap
            </p>
          </div>
        </Link>

        <Link
          href="/resources"
          className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200/60 dark:border-purple-900/40 hover:border-purple-400 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-purple-600/20">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Resource Library
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Search, filter, and add your custom links
            </p>
          </div>
        </Link>
      </div>

      {/* Progress Reset Tool */}
      <div className="flex justify-end pt-4">
        <button
          onClick={resetProgress}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset completion progress</span>
        </button>
      </div>
    </div>
  );
}
