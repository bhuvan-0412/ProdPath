'use client';

import React, { useState } from 'react';
import scheduleData from '@/data/schedule.json';
import { ScheduleItem } from '@/types/curriculum';
import { Calendar, Filter, BookOpen, CheckSquare, Award } from 'lucide-react';

export default function SchedulePage() {
  const [filterType, setFilterType] = useState<string>('all');

  const scheduleList = scheduleData.schedule as ScheduleItem[];

  const filteredItems = scheduleList.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'resources') return item.sessionType === 'Resources';
    if (filterType === 'assessment') return item.sessionType === 'Assessment';
    if (filterType === 'capstone') return item.sessionType === 'Capstone';
    return true;
  });

  const getSessionBadge = (type: ScheduleItem['sessionType']) => {
    switch (type) {
      case 'Assessment':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <CheckSquare className="w-3 h-3" />
            Assessment
          </span>
        );
      case 'Capstone':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <Award className="w-3 h-3" />
            Capstone
          </span>
        );
      case 'Resources':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50">
            <BookOpen className="w-3 h-3" />
            Resources
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>4-Week Program Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-900 dark:text-zinc-100">
            Curriculum Timeline
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Chronological roadmap of topics, quizzes, assignments, and capstone release.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-center font-mono text-xs">
          <div className="px-2 text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-[#12121a] text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All ({scheduleList.length})
          </button>

          <button
            onClick={() => setFilterType('resources')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'resources'
                ? 'bg-white dark:bg-[#12121a] text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Resources
          </button>

          <button
            onClick={() => setFilterType('assessment')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'assessment'
                ? 'bg-white dark:bg-[#12121a] text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Assessments
          </button>

          <button
            onClick={() => setFilterType('capstone')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'capstone'
                ? 'bg-white dark:bg-[#12121a] text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Capstone
          </button>
        </div>
      </div>

      {/* Vertical Timeline Rail + Nodes */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-violet-500/50 before:via-violet-500/25 before:to-zinc-300 dark:before:to-zinc-800">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 group">
            {/* Timeline Node Point */}
            <div className="absolute -left-[21px] sm:-left-[27px] mt-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0a0a0f] bg-violet-600 group-hover:scale-125 transition-transform shadow-xs z-10" />

            {/* Date Pillar */}
            <div className="w-24 sm:w-28 pt-3 flex-shrink-0 font-mono text-xs space-y-0.5">
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.date}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.dayOfWeek}</div>
            </div>

            {/* Timeline Node Content Card */}
            <div className="flex-1 bg-white dark:bg-[#12121a] p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all duration-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-semibold uppercase text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 border border-violet-200/50 dark:border-violet-800/40">
                  {item.week}
                </span>

                {getSessionBadge(item.sessionType)}
              </div>

              <h3 className="font-display font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {item.topic}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
