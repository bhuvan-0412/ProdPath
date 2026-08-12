'use client';

import React from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import liveSessionsData from '@/data/liveSessions.json';
import { LiveSession } from '@/types/curriculum';
import { Video, Check, ExternalLink, User, Tv, CheckCircle2 } from 'lucide-react';

export default function LiveSessionsPage() {
  const { isCompleted, toggleCompleted, getLiveSessionStats } = useProgress();
  const stats = getLiveSessionStats();
  const sessions = liveSessionsData.liveSessions as LiveSession[];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>On-Demand Masterclass Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-100">
            Live Sessions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Watch recorded masterclasses and expert talks from leading Product Management practitioners.
          </p>
        </div>

        {/* Live Session Progress Counter Badge */}
        <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 font-mono text-[11px]">
              <Tv className="w-3.5 h-3.5 text-violet-500" />
              Live Sessions
            </span>
            <span className="text-violet-600 dark:text-violet-400 font-mono font-bold">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
          <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 text-right">
            {stats.percentage}% Complete
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {stats.completed === stats.total && stats.total > 0 && (
        <div className="bg-violet-950/20 rounded-2xl p-5 border border-violet-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-violet-100">
              All Live Sessions Completed!
            </h3>
            <p className="text-xs text-violet-300/80 mt-0.5">
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
                  ? 'bg-zinc-50/70 dark:bg-[#12121a]/50 border-zinc-200/80 dark:border-zinc-800/60'
                  : 'bg-white dark:bg-[#12121a] border-zinc-200/90 dark:border-zinc-800 hover:border-violet-500/40 dark:hover:border-violet-500/40 shadow-xs'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleCompleted(itemId)}
                  className={`flex-shrink-0 mt-1 sm:mt-0 w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    completed
                      ? 'bg-violet-600 border-violet-600 text-white animate-pop shadow-xs'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-400 bg-zinc-50 dark:bg-zinc-900'
                  }`}
                  aria-label={`Mark session ${session.sessionNumber} as ${completed ? 'unwatched' : 'watched'}`}
                >
                  {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Session Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
                    <span className="font-semibold px-2.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 uppercase">
                      Session {session.sessionNumber}
                    </span>

                    <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/50">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>{session.speaker}</span>
                    </span>
                  </div>

                  <h3
                    className={`font-semibold text-base transition-colors ${
                      completed
                        ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal'
                        : 'text-zinc-900 dark:text-zinc-100'
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
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
