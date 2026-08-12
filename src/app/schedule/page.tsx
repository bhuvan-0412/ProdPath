'use client';

import React from 'react';
import scheduleData from '@/data/schedule.json';
import { ScheduleItem } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { Calendar, BookOpen, CheckCircle2, Check } from 'lucide-react';

export default function SchedulePage() {
  const { isCompleted, toggleCompleted, completedDates, getAllResources } = useProgress();
  const scheduleList = scheduleData.schedule as ScheduleItem[];
  const allResources = getAllResources();

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Self-Paced Learning Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-100">
            Curriculum Timeline
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track completion timestamps as you progress through your 4-week daily topics.
          </p>
        </div>
      </div>

      {/* Vertical Timeline Rail + Nodes */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-violet-500/50 before:via-violet-500/25 before:to-zinc-300 dark:before:to-zinc-800">
        {scheduleList.map((item) => {
          const { isDone, dateStr } = getScheduleItemState(item);

          return (
            <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 group">
              {/* Timeline Node Point */}
              <button
                onClick={() => handleToggleScheduleItem(item)}
                className={`absolute -left-[21px] sm:-left-[27px] mt-3.5 w-4 h-4 rounded-full border-2 transition-all shadow-xs z-10 flex items-center justify-center ${
                  isDone
                    ? 'bg-violet-600 border-violet-600 text-white scale-110'
                    : 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0a0a0f] hover:border-violet-500'
                }`}
                aria-label={`Mark ${item.topic} as ${isDone ? 'incomplete' : 'complete'}`}
              >
                {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>

              {/* Completion Date Pillar */}
              <div className="w-28 sm:w-36 pt-3 flex-shrink-0 font-mono text-xs space-y-0.5">
                {isDone ? (
                  <>
                    <div className="font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      {dateStr}
                    </div>
                  </>
                ) : (
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Not started yet
                  </div>
                )}
              </div>

              {/* Timeline Node Content Card */}
              <div
                className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-xs space-y-2 ${
                  isDone
                    ? 'bg-zinc-50/70 dark:bg-[#12121a]/60 border-zinc-200/80 dark:border-zinc-800/60'
                    : 'bg-white dark:bg-[#12121a] border-zinc-200 dark:border-zinc-800/80 hover:border-violet-500/40 dark:hover:border-violet-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-semibold uppercase text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/40">
                    {item.week} {item.day ? `• Day ${item.day}` : ''}
                  </span>

                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50">
                    <BookOpen className="w-3 h-3" />
                    Resources
                  </span>
                </div>

                <h3
                  className={`font-display font-bold text-sm sm:text-base transition-colors ${
                    isDone ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {item.topic}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
