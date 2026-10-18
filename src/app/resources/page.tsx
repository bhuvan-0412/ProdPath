'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { AddResourceModal } from '@/components/AddResourceModal';
import { EmptySearch } from '@/components/landing/Illustrations';
import { PageSkeleton } from '@/components/Skeleton';
import weeksData from '@/data/weeks.json';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { PageBackdrop } from '@/components/PageBackdrop';
import { PageIcons } from '@/components/decor/BackgroundIcons';
import { CASE_STUDY_ICONS } from '@/components/decor/iconLayouts';

// Quiet pill-style controls for the search box and filters
const PILL =
  'h-11 sm:h-10 rounded-full border border-line bg-surface text-base sm:text-sm text-ink placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none focus:outline-none focus-visible:border-accent focus:border-accent transition-colors';
// Native selects with the browser arrow hidden and a small chevron drawn on top instead
const SELECT = 'appearance-none cursor-pointer w-full sm:w-auto pl-4 pr-10';
const CHEVRON = 'w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none';

// "Week 1: PM Foundations" -> "Week 1"
const WEEK_OPTIONS = weeksData.weeks.map((w) => ({ id: w.id, label: w.title.split(':')[0].trim() }));

function ResourcesContent() {
  const { getAllResources, isCompleted, isLoadingAuth } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const allResources = getAllResources();

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

  // Progress arrives with the sign-in check; show placeholder blocks until then
  if (isLoadingAuth) return <PageSkeleton label="Loading case studies" />;

  const filtersActive = Boolean(searchQuery) || selectedWeek !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-ink">Case Studies</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 self-start sm:self-auto min-h-11 sm:min-h-10 px-4 rounded-full border border-ink/70 bg-surface text-ink text-sm font-semibold hover:shadow-offset hover:border-ink transition-all"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add custom case study
        </button>
      </div>

      {/* Search and filters: one row from 640px, stacked on phones */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Search case studies</span>
          <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search case studies"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${PILL} w-full pl-10 pr-4`}
          />
        </label>
        <label className="relative sm:w-auto">
          <span className="sr-only">Filter by week</span>
          <ChevronDown className={CHEVRON} aria-hidden="true" />
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className={`${PILL} ${SELECT}`}>
            <option value="all">All weeks</option>
            {WEEK_OPTIONS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
            <option value="custom">Custom added</option>
          </select>
        </label>
        <label className="relative sm:w-auto">
          <span className="sr-only">Filter by completion</span>
          <ChevronDown className={CHEVRON} aria-hidden="true" />
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={`${PILL} ${SELECT}`}>
            <option value="all">Any status</option>
            <option value="pending">Not completed</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedWeek('all');
              setSelectedStatus('all');
            }}
            className="self-start sm:self-auto min-h-10 px-2 text-sm font-semibold text-accent-dark hover:underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {filteredCaseStudies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCaseStudies.map((res) => (
            <CaseStudyCard key={res.id} resource={res} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-3 py-14">
          <EmptySearch className="w-20 h-20" />
          <p className="text-sm text-muted">No case studies match that search.</p>
        </div>
      )}

      <AddResourceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <>
    <PageBackdrop variant="dots" />
    <PageIcons icons={CASE_STUDY_ICONS} />
    <Suspense
      fallback={<PageSkeleton label="Loading case studies" />}
    >
      <ResourcesContent />
    </Suspense>
    </>
  );
}
