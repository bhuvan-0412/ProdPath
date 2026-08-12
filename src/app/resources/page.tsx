'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { AddResourceModal } from '@/components/AddResourceModal';
import DotGrid from '@/components/DotGrid';
import { Library, Search, Plus, Filter, BookMarked } from 'lucide-react';

function ResourcesContent() {
  const searchParams = useSearchParams();
  const { getAllResources, isCompleted, getCaseStudyStats } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  const allResources = getAllResources();
  const caseStats = getCaseStudyStats();

  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesNotes = res.notes?.toLowerCase().includes(query) || false;
        const matchesSummary = res.summary?.toLowerCase().includes(query) || false;
        const matchesTakeaways = res.takeaways?.some(t => t.toLowerCase().includes(query)) || false;
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

      // Type Filter
      if (selectedType !== 'all' && res.type !== selectedType) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        const done = isCompleted(res.id);
        if (selectedStatus === 'completed' && !done) return false;
        if (selectedStatus === 'pending' && done) return false;
      }

      return true;
    });
  }, [allResources, searchQuery, selectedWeek, selectedType, selectedStatus, isCompleted]);

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
              <Library className="w-3.5 h-3.5" />
              <span>Searchable Knowledge Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Resource Library
            </h1>
            <p className="text-sm text-zinc-300 mt-1 max-w-xl">
              Explore all curriculum articles, videos, masterclasses, and reflective case studies.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Resource</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-[#12121a] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources by title, topic, or takeaway (e.g. MECE, Metrics, SQL, PMF)..."
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

          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Types</option>
            <option value="article">Articles</option>
            <option value="video">Videos</option>
            <option value="playlist">Playlists</option>
            <option value="case-study">Case Studies</option>
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
          {(searchQuery || selectedWeek !== 'all' || selectedType !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedWeek('all');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resource Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 px-1">
        <span>Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredResources.length}</strong> resources</span>
        <button
          onClick={() => setSelectedType(selectedType === 'case-study' ? 'all' : 'case-study')}
          className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all self-start sm:self-auto ${
            selectedType === 'case-study'
              ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
              : 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-900/60'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Case Studies: {caseStats.completed}/{caseStats.total} ({caseStats.percentage}%)</span>
        </button>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} showWeekBadge={true} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#12121a] rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Library className="w-10 h-10 text-zinc-400 mx-auto opacity-60" />
          <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
            No resources match your search
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query or reset filters to view all curriculum materials.
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
    <Suspense fallback={
      <div className="p-8 text-center font-mono text-xs text-zinc-500 animate-pulse">
        Loading resources...
      </div>
    }>
      <ResourcesContent />
    </Suspense>
  );
}
