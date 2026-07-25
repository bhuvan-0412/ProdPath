'use client';

import React, { useState, useMemo } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { AddResourceModal } from '@/components/AddResourceModal';
import { ResourceType } from '@/types/curriculum';
import { Library, Search, Plus, Sparkles, Filter } from 'lucide-react';

export default function ResourcesPage() {
  const { getAllResources } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const { isCompleted } = useProgress();

  const allResources = getAllResources();

  const filteredResources = useMemo(() => {
    return allResources.filter((res) => {
      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(query);
        const matchesNotes = res.notes?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesNotes) return false;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
            <Library className="w-3.5 h-3.5" />
            <span>Searchable Knowledge Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Resource Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore and search through all curriculum materials and your custom additions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Resource</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources by title or key topic (e.g. MECE, Metrics, SQL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Week Filter */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Weeks</option>
            <option value="week-1">Week 1: PM Foundations</option>
            <option value="week-2">Week 2: Metrics & Strategy</option>
            <option value="week-3">Week 3: Tech & AI Tools</option>
            <option value="week-4">Week 4: Interview Prep</option>
            <option value="custom">Custom Added Only</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="playlist">Playlist</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          {/* Result Count Indicator */}
          <div className="ml-auto text-slate-500 font-medium">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredResources.length}</strong> of {allResources.length} resources
          </div>
        </div>
      </div>

      {/* Resource List Grid / List */}
      {filteredResources.length > 0 ? (
        <div className="space-y-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} showWeekBadge={true} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
            No resources match your active filters
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or reset filters to see all available learning items.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedWeek('all');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Modal */}
      <AddResourceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
