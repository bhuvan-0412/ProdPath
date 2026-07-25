'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddResourceModal } from '@/components/AddResourceModal';
import weeksData from '@/data/weeks.json';
import { Week } from '@/types/curriculum';
import { ChevronDown, ChevronUp, Plus, Calendar, CheckCircle, Sparkles } from 'lucide-react';

function CourseContent() {
  const searchParams = useSearchParams();
  const { getWeekStats, customResources } = useProgress();

  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [targetWeekForAdd, setTargetWeekForAdd] = useState('week-1');

  // Determine initial expanded state: auto expand first incomplete week or param
  useEffect(() => {
    const paramWeek = searchParams.get('expanded');
    const initial: Record<string, boolean> = {};

    let defaultToExpand = paramWeek || 'week-1';

    // If no explicit param, find the first incomplete week
    if (!paramWeek) {
      for (const w of weeksData.weeks) {
        const stats = getWeekStats(w.id);
        if (stats.percentage < 100) {
          defaultToExpand = w.id;
          break;
        }
      }
    }

    weeksData.weeks.forEach((w) => {
      initial[w.id] = w.id === defaultToExpand;
    });

    setExpandedWeeks(initial);
  }, [searchParams]);

  const toggleWeekExpand = (weekId: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [weekId]: !prev[weekId],
    }));
  };

  const handleOpenAddModal = (weekId: string) => {
    setTargetWeekForAdd(weekId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>4-Week Structured Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Weekly Curriculum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Check off daily learning tasks and resources as you complete them.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal('week-1')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Accordion Weeks List */}
      <div className="space-y-6">
        {(weeksData.weeks as Week[]).map((week) => {
          const stats = getWeekStats(week.id);
          const isExpanded = !!expandedWeeks[week.id];
          const isFullyDone = stats.total > 0 && stats.completed === stats.total;

          // Custom resources belonging to this week
          const customInThisWeek = customResources.filter((r) => r.weekId === week.id);

          return (
            <div
              key={week.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleWeekExpand(week.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isFullyDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {isFullyDone ? <CheckCircle className="w-5 h-5" /> : week.id.replace('week-', 'W')}
                  </div>

                  <div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{week.title}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {week.days.length} Days &bull; {stats.completed} of {stats.total} resources completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-48 flex-1">
                    <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-10 text-right">
                    {stats.percentage}%
                  </span>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content Body */}
              {isExpanded && (
                <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
                  {/* Days */}
                  {week.days.map((day) => (
                    <div
                      key={day.day}
                      className="bg-slate-50/80 dark:bg-slate-950/40 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-800/80 space-y-4"
                    >
                      {/* Day Header */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                          Day {day.day}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {day.brief}
                        </h3>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-4">
                        {day.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="space-y-2">
                            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                              {task.label}
                            </span>
                            <div className="space-y-2">
                              {task.resources.map((res) => (
                                <ResourceCard
                                  key={res.id}
                                  resource={{
                                    ...res,
                                    weekId: week.id,
                                    day: day.day,
                                    taskLabel: task.label,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Custom Resources Section if any */}
                  {customInThisWeek.length > 0 && (
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-4 sm:p-5 border border-amber-200/50 dark:border-amber-900/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                          Custom Resources Added to {week.title.split(':')[0]}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {customInThisWeek.map((res) => (
                          <ResourceCard key={res.id} resource={res} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Resource to this week button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleOpenAddModal(week.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add extra resource to {week.id.replace('-', ' ')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AddResourceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultWeekId={targetWeekForAdd}
      />
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading curriculum...
      </div>
    }>
      <CourseContent />
    </Suspense>
  );
}
