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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-accent-dark mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Self-Paced Learning Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
            Curriculum Timeline
          </h1>
          <p className="text-sm text-muted mt-1">
            Track completion timestamps as you progress through your 5-week daily topics.
          </p>
        </div>
      </div>

      {/* Vertical Timeline Rail + Nodes */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line">
        {scheduleList.map((item) => {
          const { isDone, dateStr } = getScheduleItemState(item);

          return (
            <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 group">
              {/* Timeline Node Point */}
              <button
                onClick={() => handleToggleScheduleItem(item)}
                className={`absolute -left-[21px] sm:-left-[27px] mt-3.5 w-4 h-4 rounded-full border-2 transition-all z-10 flex items-center justify-center after:absolute after:-inset-3 after:content-[''] ${
                  isDone
                    ? 'bg-accent-dark border-accent text-paper scale-110'
                    : 'border-muted bg-surface hover:border-accent'
                }`}
                aria-label={`Mark ${item.topic} as ${isDone ? 'incomplete' : 'complete'}`}
              >
                {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>

              {/* Completion Date Pillar */}
              <div className="w-28 sm:w-36 pt-3 flex-shrink-0 font-mono text-xs space-y-0.5">
                {isDone ? (
                  <>
                    <div className="font-bold text-accent-dark flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </div>
                    <div className="text-xs sm:text-[11px] text-muted font-medium">
                      {dateStr}
                    </div>
                  </>
                ) : (
                  <div className="text-xs sm:text-[11px] text-muted font-medium">
                    Not started yet
                  </div>
                )}
              </div>

              {/* Timeline Node Content Card */}
              <div
                className={`flex-1 p-4 sm:p-5 rounded-xl border transition-all duration-200 space-y-2 ${
                  isDone
                    ? 'bg-paper border-line'
                    : 'bg-surface border-line hover:border-accent'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-xs sm:text-[10px] font-semibold uppercase text-accent-dark px-2 py-0.5 rounded-md bg-accent-soft border border-accent/40">
                    {item.week} {item.day ? `• Day ${item.day}` : ''}
                  </span>

                  <span className="inline-flex items-center gap-1 font-mono text-xs sm:text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-accent-soft text-accent-dark border border-accent/40">
                    <BookOpen className="w-3 h-3" />
                    Resources
                  </span>
                </div>

                <h3
                  className={`font-display font-bold text-sm sm:text-base transition-colors ${
                    isDone ? 'line-through text-muted font-normal' : 'text-ink'
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
