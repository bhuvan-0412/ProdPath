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
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50">
            <CheckSquare className="w-3 h-3" />
            Assessment
          </span>
        );
      case 'Capstone':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
            <Award className="w-3 h-3" />
            Capstone
          </span>
        );
      case 'Resources':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
            <BookOpen className="w-3 h-3" />
            Resources
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>4-Week Timeline Roadmap</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Curriculum Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chronological overview of daily topics, quizzes, assignments, and capstone project.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-center">
          <div className="px-2 text-slate-400">
            <Filter className="w-4 h-4" />
          </div>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All ({scheduleList.length})
          </button>

          <button
            onClick={() => setFilterType('resources')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'resources'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Resources
          </button>

          <button
            onClick={() => setFilterType('assessment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'assessment'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Assessments
          </button>

          <button
            onClick={() => setFilterType('capstone')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'capstone'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Capstone
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Day</th>
                <th className="py-4 px-6">Week</th>
                <th className="py-4 px-6">Topic / Milestone</th>
                <th className="py-4 px-6 text-right">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                    {item.dayOfWeek}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      {item.week}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                    {item.topic}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {getSessionBadge(item.sessionType)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
