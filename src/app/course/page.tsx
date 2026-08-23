'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddResourceModal } from '@/components/AddResourceModal';
import weeksData from '@/data/weeks.json';
import continuedLearningData from '@/data/continuedLearning.json';
import { Week } from '@/types/curriculum';
import { Plus, Calendar, CheckCircle, Sparkles, ArrowRight, Bookmark, ExternalLink } from 'lucide-react';

const getTaskDomId = (weekId: string, dayNum: number, taskLabel: string) => {
  const n = weekId.replace('week-', '');
  const cleanLabel = taskLabel.toLowerCase().replace(/^task[\s-_]*/i, '').replace(/[^a-z0-9]+/g, '-') || taskLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `week-${n}-day-${dayNum}-task-${cleanLabel}`;
};

const getDayDomId = (weekId: string, dayNum: number) => {
  const n = weekId.replace('week-', '');
  return `week-${n}-day-${dayNum}`;
};

const getWeekScrollTargetId = (week: Week, completedIds: Set<string>): string => {
  const allTasks: { dayNum: number; taskLabel: string; isCompleted: boolean }[] = [];

  week.days.forEach((dayObj) => {
    dayObj.tasks.forEach((taskObj) => {
      const isCompleted =
        taskObj.resources.length > 0 &&
        taskObj.resources.every((res) => completedIds.has(res.id));
      allTasks.push({
        dayNum: dayObj.day,
        taskLabel: taskObj.label,
        isCompleted,
      });
    });
  });

  if (allTasks.length === 0) {
    return getDayDomId(week.id, 1);
  }

  const completedTasks = allTasks.filter((t) => t.isCompleted);

  if (completedTasks.length === 0) {
    return getDayDomId(week.id, 1);
  } else if (completedTasks.length === allTasks.length) {
    const lastTask = allTasks[allTasks.length - 1];
    return getTaskDomId(week.id, lastTask.dayNum, lastTask.taskLabel);
  } else {
    const lastCompleted = completedTasks[completedTasks.length - 1];
    return getTaskDomId(week.id, lastCompleted.dayNum, lastCompleted.taskLabel);
  }
};

const scrollToId = (id: string) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

function CourseContent() {
  const searchParams = useSearchParams();
  const { getWeekStats, customResources, completedIds } = useProgress();

  const [activeWeekId, setActiveWeekId] = useState<string>('week-1');
  const [modalOpen, setModalOpen] = useState(false);
  const [targetWeekForAdd, setTargetWeekForAdd] = useState('week-1');

  const weeks = weeksData.weeks as Week[];

  // Determine initial active week tab and auto-scroll target
  useEffect(() => {
    const paramWeek = searchParams.get('expanded');
    const paramTargetRes = searchParams.get('targetRes');
    const paramTargetTask = searchParams.get('targetTask');

    let initialWeekId = 'week-1';

    if (paramWeek && weeks.some((w) => w.id === paramWeek)) {
      initialWeekId = paramWeek;
    } else {
      for (const w of weeks) {
        const stats = getWeekStats(w.id);
        if (stats.percentage < 100) {
          initialWeekId = w.id;
          break;
        }
      }
    }

    setActiveWeekId(initialWeekId);

    if (paramTargetRes) {
      scrollToId(`resource-${paramTargetRes}`);
    } else if (paramTargetTask) {
      scrollToId(paramTargetTask);
    } else if (paramWeek) {
      const targetWeek = weeks.find((w) => w.id === initialWeekId);
      if (targetWeek) {
        const targetId = getWeekScrollTargetId(targetWeek, completedIds);
        scrollToId(targetId);
      }
    }
  }, [searchParams, getWeekStats, weeks, completedIds]);

  const activeWeek = weeks.find((w) => w.id === activeWeekId) || weeks[0];
  const activeWeekStats = getWeekStats(activeWeek.id);
  const activeCustomResources = customResources.filter((r) => r.weekId === activeWeek.id);

  const handleSelectWeekTab = (weekId: string) => {
    setActiveWeekId(weekId);
    const targetWeek = weeks.find((w) => w.id === weekId);
    if (targetWeek) {
      const targetId = getWeekScrollTargetId(targetWeek, completedIds);
      scrollToId(targetId);
    }
  };

  const handleOpenAddModal = (weekId: string) => {
    setTargetWeekForAdd(weekId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>5-Week Structured Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-100">
            Weekly Curriculum
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Select a week to navigate daily topics, task lists, and learning resources.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(activeWeekId)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Horizontal Week Navigation Tabs (Signature Glass on Active) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {weeks.map((w) => {
          const stats = getWeekStats(w.id);
          const isActive = w.id === activeWeekId;
          const isDone = stats.total > 0 && stats.completed === stats.total;

          return (
            <button
              key={w.id}
              onClick={() => handleSelectWeekTab(w.id)}
              className={`p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                isActive
                  ? 'glass-signature shadow-md ring-2 ring-violet-500/50'
                  : 'bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {w.id.replace('week-', 'Week ')}
                </span>
                <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
                  {stats.completed}/{stats.total}
                </span>
              </div>

              <div>
                <h3
                  className={`font-display font-bold text-sm line-clamp-1 ${
                    isActive ? 'text-violet-600 dark:text-violet-300' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {w.title.split(': ')[1] || w.title}
                </h3>
              </div>

              <div className="space-y-1 pt-1">
                <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>{stats.percentage}% done</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Week Details Header */}
      <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-violet-600 dark:text-violet-400">
              Active Module &bull; {activeWeek.id.replace('-', ' ')}
            </span>
            <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {activeWeek.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-48">
              <ProgressBar percentage={activeWeekStats.percentage} showLabel={true} completed={activeWeekStats.completed} total={activeWeekStats.total} size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Day-by-Day Vertical List under Active Tab */}
      <div className="space-y-6">
        {activeWeek.days.map((day) => (
          <div
            key={day.day}
            id={getDayDomId(activeWeek.id, day.day)}
            className="bg-white dark:bg-[#12121a] rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800/80 space-y-4 shadow-xs scroll-mt-24"
          >
            {/* Day Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-mono font-bold text-xs">
                Day {day.day}
              </span>
              <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100 text-base">
                {day.brief}
              </h3>
            </div>

            {/* Tasks */}
            <div className="space-y-4">
              {day.tasks.map((task, tIdx) => (
                <div
                  key={tIdx}
                  id={getTaskDomId(activeWeek.id, day.day, task.label)}
                  className="space-y-2 scroll-mt-24"
                >
                  <span className="text-[10px] font-mono font-semibold uppercase text-zinc-400 dark:text-zinc-500 block">
                    {task.label}
                  </span>
                  <div className="space-y-2">
                    {task.resources.map((res) => (
                      <ResourceCard
                        key={res.id}
                        resource={{
                          ...res,
                          weekId: activeWeek.id,
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
        {activeCustomResources.length > 0 && (
          <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200/50 dark:border-amber-900/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="font-display font-bold text-amber-900 dark:text-amber-200 text-sm">
                Custom Resources Added to {activeWeek.title.split(':')[0]}
              </h4>
            </div>
            <div className="space-y-2">
              {activeCustomResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          </div>
        )}

        {/* Add Extra Resource CTA */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleOpenAddModal(activeWeek.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add extra resource to {activeWeek.id.replace('-', ' ')}</span>
          </button>
        </div>
      </div>

      {/* Continued Learning Section (Independent Subscriptions) */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-zinc-900 dark:text-zinc-100">
              Continued Learning &amp; Subscriptions
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ongoing publications, newsletters, and podcasts for continuous AI Product Management growth.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continuedLearningData.continuedLearning.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#12121a] rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/80 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 text-[10px] font-mono font-semibold uppercase">
                    {item.cadence}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all group"
                >
                  <span>Visit Publication</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
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
      <div className="p-8 text-center font-mono text-xs text-zinc-500 animate-pulse">
        Loading curriculum...
      </div>
    }>
      <CourseContent />
    </Suspense>
  );
}
