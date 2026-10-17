'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ResourceCard } from '@/components/ResourceCard';
import { AddResourceModal } from '@/components/AddResourceModal';
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
      {/* Header */}
      <div className="rounded-xl bg-surface border border-line p-6 sm:p-8 text-ink">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent-dark mb-1">
              <BookMarked className="w-3.5 h-3.5" />
              <span>PM Strategy & Case Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-ink">
              Case Studies
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Analyze real-world product decisions, breakthrough strategic frameworks, and actionable executive takeaways.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-dark hover:bg-accent-dark/90 text-paper text-xs font-bold transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Case Study</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Week/Status Filters */}
      <div className="bg-surface p-4 rounded-xl border border-line space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search case studies by title, summary, or takeaway (e.g. First Principles, Growth, Strategy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-base sm:text-sm bg-paper border border-line text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-muted mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Week Selector */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="min-h-10 sm:min-h-0 px-3 py-1.5 rounded-lg text-base sm:text-xs bg-paper text-ink/80 border border-line font-medium focus:outline-none focus:ring-1 focus:ring-accent"
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
            className="min-h-10 sm:min-h-0 px-3 py-1.5 rounded-lg text-base sm:text-xs bg-paper text-ink/80 border border-line font-medium focus:outline-none focus:ring-1 focus:ring-accent"
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
              className="text-xs text-accent-dark hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Case Study Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted px-1">
        <span>
          Showing <strong className="text-ink">{filteredCaseStudies.length}</strong> case studies
        </span>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-accent-soft text-accent-dark border border-accent/40 self-start sm:self-auto">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Case Studies Progress: {caseStats.completed}/{caseStats.total} ({caseStats.percentage}%)</span>
        </div>
      </div>

      {/* Grid of Case Study Cards */}
      {filteredCaseStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCaseStudies.map((res) => (
            <ResourceCard key={res.id} resource={res} showWeekBadge={true} glow />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-xl p-12 text-center border border-line space-y-3">
          <BookMarked className="w-10 h-10 text-muted mx-auto opacity-60" />
          <h3 className="font-display text-base font-bold text-ink">
            No case studies match your filter
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
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
        <div className="p-8 text-center text-xs text-muted animate-pulse">
          Loading case studies...
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
