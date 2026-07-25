'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import liveSessionsData from '@/data/liveSessions.json';
import { LiveSession } from '@/types/curriculum';
import { Video, Check, ExternalLink, User, Sparkles, Tv, CheckCircle2 } from 'lucide-react';

export default function LiveSessionsPage() {
  const { isCompleted, toggleCompleted, getLiveSessionStats } = useProgress();
  const stats = getLiveSessionStats();
  const sessions = liveSessionsData.liveSessions as LiveSession[];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>On-Demand Watch List</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Live Sessions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Watch recorded masterclasses and expert sessions from top Product Management leaders.
          </p>
        </div>

        {/* Live Session Progress Counter Badge */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-indigo-500" />
              Live Sessions Progress
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
              {stats.completed}/{stats.total} Watched
            </span>
          </div>
          <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
            {stats.percentage}% Complete
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {stats.completed === stats.total && stats.total > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              All Live Sessions Completed!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              Awesome job watching all {stats.total} masterclasses in the on-demand library.
            </p>
          </div>
        </div>
      )}

      {/* Live Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const itemId = `live-session-${session.sessionNumber}`;
          const completed = isCompleted(itemId);

          return (
            <div
              key={session.sessionNumber}
              className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                completed
                  ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleCompleted(itemId)}
                  className={`flex-shrink-0 mt-1 sm:mt-0 w-6 h-6 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    completed
                      ? 'bg-emerald-500 border-emerald-500 text-white animate-pop shadow-xs'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800'
                  }`}
                  aria-label={`Mark session ${session.sessionNumber} as ${completed ? 'unwatched' : 'watched'}`}
                >
                  {completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Session Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
                      Session {session.sessionNumber}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{session.speaker}</span>
                    </span>
                  </div>

                  <h3
                    className={`font-bold text-base transition-colors ${
                      completed
                        ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {session.topic}
                  </h3>
                </div>
              </div>

              {/* Watch Button */}
              <div className="self-end sm:self-center flex-shrink-0">
                <a
                  href={session.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Watch</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
