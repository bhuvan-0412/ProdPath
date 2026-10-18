'use client';

import React from 'react';
import { GlowCard } from '@/components/GlowCard';
import { useProgress } from '@/context/ProgressContext';
import { ProgressBar } from '@/components/ProgressBar';
import liveSessionsData from '@/data/liveSessions.json';
import { LiveSession } from '@/types/curriculum';
import { Check, ExternalLink, Play } from 'lucide-react';
import { MiniFlag, PlayScreenIcon } from '@/components/landing/Illustrations';
import { PageSkeleton } from '@/components/Skeleton';
import { PageBackdrop } from '@/components/PageBackdrop';
import { PageIcons } from '@/components/decor/BackgroundIcons';
import { LIVE_SESSION_ICONS } from '@/components/decor/iconLayouts';

export default function LiveSessionsPage() {
  const { isCompleted, toggleCompleted, getLiveSessionStats, isLoadingAuth } = useProgress();
  const stats = getLiveSessionStats();
  const sessions = liveSessionsData.liveSessions as LiveSession[];
  const allWatched = stats.total > 0 && stats.completed === stats.total;

  return (
    <>
    <PageBackdrop variant="dots" />
    <PageIcons icons={LIVE_SESSION_ICONS} />
    {isLoadingAuth ? (
      <PageSkeleton cards={6} label="Loading live sessions" />
    ) : (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-ink">Live Sessions</h1>
        {/* Progress line */}
        <div className="w-full sm:w-56">
          <p className="text-sm text-muted tabular-nums">
            <span className="font-semibold text-ink">{stats.completed}</span> of {stats.total} watched
          </p>
          <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" className="mt-1.5" />
        </div>
      </div>

      {allWatched && (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <MiniFlag className="w-6 h-7 flex-shrink-0" />
          All sessions watched.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => {
          const itemId = `live-session-${session.sessionNumber}`;
          const completed = isCompleted(itemId);
          const titleId = `session-title-${session.sessionNumber}`;

          return (
            <GlowCard
              key={session.sessionNumber}
              className={`flex flex-col rounded-card border p-5 transition-colors ${
                completed ? 'bg-accent-soft/40 border-accent/40' : 'bg-surface border-line'
              }`}
            >
              <div className="flex items-start gap-4">
                <PlayScreenIcon className="w-11 h-11 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Session {session.sessionNumber}</p>
                  <h2 id={titleId} className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
                    {session.topic}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{session.speaker}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line flex items-center justify-between gap-3">
                {/* Watched checkbox */}
                <button
                  type="button"
                  onClick={() => toggleCompleted(itemId)}
                  aria-pressed={completed}
                  aria-label={`Mark session ${session.sessionNumber} as ${completed ? 'unwatched' : 'watched'}`}
                  className="group/check inline-flex items-center gap-2.5 min-h-11 sm:min-h-10 -ml-1 px-1 rounded-lg text-sm font-medium"
                >
                  <span
                    className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-colors ${
                      completed ? 'bg-accent border-accent text-paper animate-pop' : 'border-ink/50 group-hover/check:border-ink bg-surface'
                    }`}
                  >
                    {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                  <span className={completed ? 'text-accent-dark' : 'text-muted'}>{completed ? 'Watched' : 'Mark as watched'}</span>
                </button>

                <a
                  href={session.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-describedby={titleId}
                  className="inline-flex items-center gap-2 min-h-11 sm:min-h-10 px-4 rounded-full bg-accent-dark hover:bg-accent-dark/90 text-paper text-sm font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  Watch
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                </a>
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
    )}
    </>
  );
}
