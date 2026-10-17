'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddResourceModal } from '@/components/AddResourceModal';
import { TaskHeader } from '@/components/ResourcePanels';
import { GlowCard } from '@/components/GlowCard';
import weeksData from '@/data/weeks.json';
import taskSummariesData from '@/data/taskSummaries.json';
import continuedLearningData from '@/data/continuedLearning.json';
import { Week } from '@/types/curriculum';
import { WeekMark } from '@/components/landing/Illustrations';
import { Plus, Calendar, CheckCircle, Sparkles, ArrowRight, Bookmark, ExternalLink, Video, BookMarked } from 'lucide-react';

const getTaskDomId = (weekId: string, dayNum: number, taskLabel: string) => {
  const n = weekId.replace('week-', '');
  const cleanLabel = taskLabel.toLowerCase().replace(/^task[\s-_]*/i, '').replace(/[^a-z0-9]+/g, '-') || taskLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `week-${n}-day-${dayNum}-task-${cleanLabel}`;
};

const taskSummaries = taskSummariesData.taskSummaries as Record<string, string>;

const getTaskSummaryKey = (weekId: string, dayNum: number, taskLabel: string) =>
  `${weekId}-d${dayNum}-${taskLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

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
  const weekStripRef = useRef<HTMLDivElement>(null);

  // On phones the week tabs are a horizontal strip: keep the active week in view
  useEffect(() => {
    const strip = weekStripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const tab = strip.querySelector<HTMLElement>(`[data-week-tab="${activeWeekId}"]`);
    if (!tab) return;
    const left = tab.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft - 16;
    strip.scrollTo({ left, behavior: 'smooth' });
  }, [activeWeekId]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-dark mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>5-Week Structured Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink">
            Weekly Curriculum
          </h1>
          <p className="text-sm text-muted mt-1">
            Select a week to navigate daily topics, task lists, and learning resources.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(activeWeekId)}
          className="inline-flex items-center gap-2 min-h-11 sm:min-h-0 px-4 py-2.5 rounded-xl bg-accent-dark hover:bg-accent-dark/90 text-paper text-xs font-bold transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Horizontal Week & Module Navigation Tabs */}
      <div
        ref={weekStripRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7"
      >
        {weeks.map((w) => {
          const stats = getWeekStats(w.id);
          const isActive = w.id === activeWeekId;
          const isDone = stats.total > 0 && stats.completed === stats.total;

          return (
            <GlowCard
              as="button"
              key={w.id}
              onClick={() => handleSelectWeekTab(w.id)}
              data-week-tab={w.id}
              className={`snap-start shrink-0 w-[44%] sm:w-auto p-4 rounded-xl text-left transition-colors duration-200 flex flex-col justify-between space-y-3 bg-surface border border-line ${
                isActive ? 'ring-2 ring-accent/50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isActive
                      ? 'bg-accent-dark text-paper'
                      : isDone
                      ? 'bg-accent text-paper'
                      : 'bg-paper text-muted'
                  }`}
                >
                  {w.id.replace('week-', 'Week ')}
                </span>
                <span className="text-xs font-semibold text-muted">
                  {stats.completed}/{stats.total}
                </span>
              </div>

              <div>
                <h3
                  className={`font-display font-bold text-sm line-clamp-1 ${
                    isActive ? 'text-accent-dark' : 'text-ink'
                  }`}
                >
                  {w.title.split(': ')[1] || w.title}
                </h3>
              </div>

              <div className="space-y-1 pt-1">
                <ProgressBar percentage={stats.percentage} showLabel={false} size="sm" />
                <div className="flex justify-between items-center text-xs sm:text-[10px] text-muted">
                  <span>{stats.percentage}% done</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-accent" />}
                </div>
              </div>
            </GlowCard>
          );
        })}

        {/* Live Sessions Navigation Tab */}
        <GlowCard
          as={Link}
          href="/live-sessions"
          className="snap-start shrink-0 w-[44%] sm:w-auto p-4 rounded-xl text-left bg-accent-soft border border-accent/40 transition-colors duration-200 flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-accent-dark text-paper flex items-center gap-1">
              Live <Video className="w-2.5 h-2.5" />
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-accent-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark line-clamp-1">
              Live Sessions
            </h3>
          </div>

          <div className="pt-1 text-xs sm:text-[10px] text-muted">
            <span>Speaker talks &rarr;</span>
          </div>
        </GlowCard>

        {/* Case Studies Navigation Tab */}
        <GlowCard
          as={Link}
          href="/resources"
          className="snap-start shrink-0 w-[44%] sm:w-auto p-4 rounded-xl text-left bg-accent-soft border border-accent/40 transition-colors duration-200 flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider bg-accent-dark text-paper flex items-center gap-1">
              Library <BookMarked className="w-2.5 h-2.5" />
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-accent-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <div>
            <h3 className="font-display font-bold text-sm text-ink group-hover:text-accent-dark line-clamp-1">
              Case Studies
            </h3>
          </div>

          <div className="pt-1 text-xs sm:text-[10px] text-muted">
            <span>Teardowns &amp; Strategy &rarr;</span>
          </div>
        </GlowCard>
      </div>

      {/* Active Week Details Header */}
      <div className="bg-surface rounded-xl p-4 sm:p-6 border border-line space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-dark">
              Active Module &bull; {activeWeek.id.replace('-', ' ')}
            </span>
            <h2 className="text-xl font-display font-bold text-ink mt-1 flex items-center gap-3">
              <WeekMark index={weeks.indexOf(activeWeek)} className="w-9 h-9 flex-shrink-0" />
              <span>{activeWeek.title}</span>
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
          <GlowCard
            key={day.day}
            id={getDayDomId(activeWeek.id, day.day)}
            className="bg-surface rounded-xl p-4 sm:p-6 border border-line space-y-4 scroll-mt-24"
          >
            {/* Day Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-line">
              <span className="px-2.5 py-1 rounded-lg bg-accent-dark text-paper font-bold text-xs">
                Day {day.day}
              </span>
              <h3 className="font-display font-bold text-ink text-base">
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
                  <TaskHeader
                    label={task.label}
                    summary={taskSummaries[getTaskSummaryKey(activeWeek.id, day.day, task.label)]}
                  />
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
          </GlowCard>
        ))}

        {/* Custom Resources Section if any */}
        {activeCustomResources.length > 0 && (
          <div className="bg-marigold/15 rounded-xl p-5 border border-marigold/40 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-marigold" />
              <h4 className="font-display font-bold text-ink text-sm">
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
            className="inline-flex items-center gap-1.5 min-h-10 sm:min-h-0 text-xs font-semibold text-accent-dark hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add extra resource to {activeWeek.id.replace('-', ' ')}</span>
          </button>
        </div>
      </div>

      {/* Continued Learning Section (Independent Subscriptions) */}
      <div className="pt-6 border-t border-line space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-ink">
              Continued Learning &amp; Subscriptions
            </h2>
            <p className="text-xs text-muted">
              Ongoing publications, newsletters, and podcasts for continuous AI Product Management growth.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {continuedLearningData.continuedLearning.map((item) => (
            <GlowCard
              key={item.id}
              className="bg-surface rounded-xl p-5 border border-line transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-base text-ink">
                    {item.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-accent-soft text-accent-dark border border-accent/40 text-xs sm:text-[10px] font-semibold uppercase tracking-wider">
                    {item.cadence}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 min-h-10 sm:min-h-0 px-3.5 py-2 rounded-xl bg-paper hover:bg-accent-dark/90 hover:text-paper text-ink/80 text-xs font-semibold transition-all group"
                >
                  <span>Visit Publication</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </GlowCard>
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
      <div className="p-8 text-center text-xs text-muted animate-pulse">
        Loading curriculum...
      </div>
    }>
      <CourseContent />
    </Suspense>
  );
}
