'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { AddResourceModal } from '@/components/AddResourceModal';
import DotGrid from '@/components/DotGrid';
import { BookMarked, Search, Plus, Filter } from 'lucide-react';

function ResourcesContent() {
  const { getAllResources, isCompleted, getCaseStudyStats } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const allResources = getAllResources();
  const caseStats = getCaseStudyStats();

  // Filter ONLY case studies (from caseStudies.json and any custom case studies)
  const caseStudiesOnly = useMemo(() => {
    return allResources.filter((res) => res.type === 'case-study');
  }, [allResources]);

  const filteredCaseStudies = useMemo(() => {
    return caseStudiesOnly.filter((res) => {
      // Text Search across title, summary, takeaways, and personal notes
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesNotes = res.notes?.toLowerCase().includes(query) || false;
        const matchesSummary = res.summary?.toLowerCase().includes(query) || false;
        const matchesTakeaways = res.takeaways?.some((t) => t.toLowerCase().includes(query)) || false;
        if (!matchesTitle && !matchesNotes && !matchesSummary && !matchesTakeaways) return false;
      }

      // Week Filter
      if (selectedWeek !== 'all') {
        if (selectedWeek === 'custom') {
          if (!res.isCustom) return false;
        } else if (res.weekId !== selectedWeek) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        const done = isCompleted(res.id);
        if (selectedStatus === 'completed' && !done) return false;
        if (selectedStatus === 'pending' && done) return false;
      }

      return true;
    });
  }, [caseStudiesOnly, searchQuery, selectedWeek, selectedStatus, isCompleted]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Interactive DotGrid Canvas */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 z-0 opacity-80">
          <DotGrid
            dotSize={3}
            dotSpacing={26}
            dotColor="rgba(139, 92, 246, 0.45)"
            glowColor="rgba(167, 139, 250, 1.0)"
            proximityRadius={140}
            shockwaveSpeed={9}
            shockwaveIntensity={18}
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-violet-400 mb-1">
              <BookMarked className="w-3.5 h-3.5" />
              <span>PM Strategy & Case Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Case Studies
            </h1>
            <p className="text-sm text-zinc-300 mt-1 max-w-xl">
              Analyze real-world product decisions, breakthrough strategic frameworks, and actionable executive takeaways.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Case Study</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Week/Status Filters */}
      <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search case studies by title, summary, or takeaway (e.g. First Principles, Growth, Strategy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 font-bold text-zinc-500 dark:text-zinc-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Week Selector */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Weeks</option>
            <option value="week-1">Week 1 (PM Foundations)</option>
            <option value="week-2">Week 2 (Metrics, MVP & Strategy)</option>
            <option value="week-3">Week 3 (Tech & AI Tools)</option>
            <option value="week-4">Week 4 (Interview Prep)</option>
            <option value="custom">Custom Added</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Uncompleted</option>
            <option value="completed">Completed</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedWeek !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedWeek('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Case Study Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredCaseStudies.length}</strong> case studies
        </span>
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 self-start sm:self-auto">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Case Studies Progress: {caseStats.completed}/{caseStats.total} ({caseStats.percentage}%)</span>
        </div>
      </div>

      {/* Grid of Case Study Cards */}
      {filteredCaseStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCaseStudies.map((res) => (
            <ResourceCard key={res.id} resource={res} showWeekBadge={true} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
          <BookMarked className="w-10 h-10 text-zinc-400 mx-auto opacity-60" />
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
            No case studies match your filter
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query or reset filters to view all PM case studies.
          </p>
        </div>
      )}

      {/* Add Custom Resource Modal */}
      <AddResourceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-mono text-xs text-zinc-500 animate-pulse">
          Loading case studies...
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
