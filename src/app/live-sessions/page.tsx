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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-dark mb-1">
            <Video className="w-3.5 h-3.5" />
            <span>On-Demand Masterclass Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
            Live Sessions
          </h1>
          <p className="text-sm text-muted mt-1">
            Watch recorded masterclasses and expert talks from leading Product Management practitioners.
          </p>
        </div>

        {/* Live Session Progress Counter Badge */}
        <div className="bg-surface p-4 rounded-xl border border-line min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted flex items-center gap-1.5 text-xs sm:text-[11px]">
              <Tv className="w-3.5 h-3.5 text-accent-dark" />
              Live Sessions
            </span>
            <span className="text-accent-dark font-bold">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
          <div className="text-xs sm:text-[11px] text-muted text-right">
            {stats.percentage}% Complete
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {stats.completed === stats.total && stats.total > 0 && (
        <div className="bg-accent-soft rounded-xl p-5 border border-accent/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-dark text-paper flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-ink">
              All Live Sessions Completed!
            </h3>
            <p className="text-xs text-accent-dark mt-0.5">
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
              className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                completed
                  ? 'bg-paper border-line'
                  : 'bg-surface border-line hover:border-accent '
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Checkbox */}
                <button
                  onClick={() => toggleCompleted(itemId)}
                  className={`relative flex-shrink-0 mt-1 sm:mt-0 w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center after:absolute after:-inset-2.5 after:content-[''] ${
                    completed
                      ? 'bg-accent-dark border-accent text-paper animate-pop'
                      : 'border-line hover:border-accent bg-paper'
                  }`}
                  aria-label={`Mark session ${session.sessionNumber} as ${completed ? 'unwatched' : 'watched'}`}
                >
                  {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Session Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs sm:text-[10px]">
                    <span className="font-semibold px-2.5 py-0.5 rounded-md bg-accent-soft text-accent-dark border border-accent/40 uppercase">
                      Session {session.sessionNumber}
                    </span>

                    <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-md bg-paper text-muted border border-line">
                      <User className="w-3 h-3 text-muted" />
                      <span>{session.speaker}</span>
                    </span>
                  </div>

                  <h3
                    className={`font-semibold text-base transition-colors ${
                      completed
                        ? 'line-through text-muted font-normal'
                        : 'text-ink'
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
                  className="inline-flex items-center gap-2 min-h-11 sm:min-h-0 px-4 py-2.5 rounded-xl bg-accent-dark hover:bg-accent-dark/90 text-paper text-xs font-bold transition-all active:scale-95"
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
