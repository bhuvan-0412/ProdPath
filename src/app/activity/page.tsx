'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import scheduleData from '@/data/schedule.json';
import { ScheduleItem } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { Check, ArrowRight } from 'lucide-react';
import { HeatMap } from '@/components/activity/HeatMap';
import { Flame, EmptyFlag } from '@/components/landing/Illustrations';
import { countByDay, getActivityStats, buildHeatMap } from '@/lib/activity';
import { PageBackdrop } from '@/components/PageBackdrop';
import { PageIcons } from '@/components/decor/BackgroundIcons';
import { ACTIVITY_ICONS } from '@/components/decor/iconLayouts';

const scheduleList = scheduleData.schedule as ScheduleItem[];

const StatTile: React.FC<{ value: number | null; label: string; children?: React.ReactNode }> = ({ value, label, children }) => (
  <div className="relative rounded-card border border-line bg-surface p-4 sm:p-5">
    {children}
    <p className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-none tabular-nums">{value ?? '–'}</p>
    <p className="mt-2 text-xs sm:text-sm text-muted">{label}</p>
  </div>
);

export default function ActivityPage() {
  const { isCompleted, toggleCompleted, completedDates, getAllResources } = useProgress();
  const allResources = getAllResources();

  // "Today" is only known in the browser (the page is pre-rendered), so wait for it before drawing
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  // Count curriculum, session, case-study and custom items, plus timeline items that stand on their own.
  // Day-level timeline markers are left out: ticking one also ticks that day's resources, so they would count twice.
  const counts = useMemo(() => {
    const countIds = new Set(getAllResources().map((r) => r.id));
    scheduleList.forEach((item) => {
      if (!item.day) countIds.add(item.id);
    });
    return countByDay(completedDates, countIds);
  }, [getAllResources, completedDates]);

  const stats = useMemo(() => (now ? getActivityStats(counts, now) : null), [counts, now]);
  const heatMap = useMemo(() => (now ? buildHeatMap(counts, now) : null), [counts, now]);
  const isEmpty = counts.size === 0;

  // Helper to determine if a schedule item is completed and fetch its completion timestamp
  const getScheduleItemState = (item: ScheduleItem) => {
    const directDone = isCompleted(item.id);
    const directDate = completedDates[item.id];

    if (item.day) {
      const weekId = item.week.toLowerCase().replace(' ', '-');
      const dayResources = allResources.filter((r) => r.weekId === weekId && r.day === item.day);
      const allDayCompleted = dayResources.length > 0 && dayResources.every((r) => isCompleted(r.id));

      if (allDayCompleted || directDone) {
        const dates = dayResources.map((r) => completedDates[r.id]).filter(Boolean);
        if (directDate) dates.push(directDate);

        const dateStr = dates.length > 0 ? dates[dates.length - 1] : 'Completed';
        return { isDone: true, dateStr };
      }
    }

    if (directDone) {
      return { isDone: true, dateStr: directDate || 'Completed' };
    }

    return { isDone: false, dateStr: null };
  };

  const handleToggleScheduleItem = (item: ScheduleItem) => {
    toggleCompleted(item.id);
    if (item.day) {
      const weekId = item.week.toLowerCase().replace(' ', '-');
      const dayResources = allResources.filter((r) => r.weekId === weekId && r.day === item.day);
      const currentlyDone = getScheduleItemState(item).isDone;
      dayResources.forEach((r) => {
        if (!currentlyDone && !isCompleted(r.id)) {
          toggleCompleted(r.id);
        } else if (currentlyDone && isCompleted(r.id)) {
          toggleCompleted(r.id);
        }
      });
    }
  };

  return (
    <>
    <PageBackdrop variant="contours" />
    <PageIcons icons={ACTIVITY_ICONS} />
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink">Activity</h1>

      {/* Stats */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatTile value={stats?.currentStreak ?? null} label="Current streak (days)">
            <Flame className="absolute top-3 right-3 w-7 h-8 sm:w-8 sm:h-9" />
          </StatTile>
          <StatTile value={stats?.longestStreak ?? null} label="Longest streak (days)" />
          <StatTile value={stats?.activeDays ?? null} label="Active days" />
          <StatTile value={stats?.doneThisWeek ?? null} label="Done this week" />
        </div>
        {stats && stats.currentStreak >= 3 && (
          <p className="mt-4 text-sm font-medium text-accent-dark">
            {stats.currentStreak} days in a row. Keep it going.
          </p>
        )}
      </div>

      {/* Heat map */}
      <section aria-labelledby="heatmap-heading" className="rounded-card border border-line bg-surface p-4 sm:p-6">
        <h2 id="heatmap-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-4">
          Last 12 weeks
        </h2>
        {heatMap ? <HeatMap data={heatMap} /> : <div className="h-[230px]" aria-hidden="true" />}

        {now && isEmpty && (
          <div className="mt-6 pt-6 border-t border-line flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <EmptyFlag className="w-24 flex-shrink-0" />
            <div className="space-y-3">
              <p className="text-ink">Tick off your first item and this fills in.</p>
              <Link
                href="/course"
                className="inline-flex items-center gap-2 min-h-10 px-4 rounded-lg bg-accent-dark text-paper text-sm font-semibold hover:bg-accent-dark/90 transition-colors"
              >
                Go to the course
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Dated timeline */}
      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-xl sm:text-2xl font-display font-semibold text-ink mb-4">
          Timeline
        </h2>
        <ol className="rounded-card border border-line bg-surface divide-y divide-line">
          {scheduleList.map((item) => {
            const { isDone, dateStr } = getScheduleItemState(item);

            return (
              <li key={item.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5">
                <button
                  onClick={() => handleToggleScheduleItem(item)}
                  className="relative flex-shrink-0 after:absolute after:-inset-2.5 after:content-['']"
                  aria-label={`Mark ${item.topic} as ${isDone ? 'incomplete' : 'complete'}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                      isDone ? 'bg-accent border-accent text-paper' : 'border-ink/50 bg-surface hover:border-accent'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDone ? 'text-muted' : 'text-ink'}`}>{item.topic}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {item.week}
                    {item.day ? ` · Day ${item.day}` : ''}
                  </p>
                </div>
                <span className={`text-xs whitespace-nowrap tabular-nums ${isDone ? 'text-accent-dark font-semibold' : 'text-muted'}`}>
                  {isDone ? dateStr : '–'}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
    </>
  );
}
