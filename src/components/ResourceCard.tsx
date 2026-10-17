'use client';

import React, { useState } from 'react';
import { Resource } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { NotesPanel, SummaryPanel } from '@/components/ResourcePanels';
import summariesData from '@/data/summaries.json';
import { GlowCard } from '@/components/GlowCard';
import { Video, FileText, ListVideo, ExternalLink, Check, Trash2, Sparkles, BookMarked, ChevronDown, ChevronUp, PenLine, WandSparkles } from 'lucide-react';

const summaries = summariesData.summaries as Record<string, string[]>;

interface ResourceCardProps {
  resource: Resource;
  showWeekBadge?: boolean;
  defaultExpandedTakeaways?: boolean;
  /** Pointer-following border glow (used for the Case Studies grid) */
  glow?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  showWeekBadge = false,
  defaultExpandedTakeaways = false,
  glow = false,
}) => {
  const { isCompleted, toggleCompleted, deleteCustomResource, getNote } = useProgress();
  const completed = isCompleted(resource.id);
  const [takeawaysExpanded, setTakeawaysExpanded] = useState(defaultExpandedTakeaways);
  const [openPanel, setOpenPanel] = useState<'notes' | 'summary' | null>(null);
  const hasNote = getNote(resource.id) !== '';
  const summaryPoints = summaries[resource.id];

  const togglePanel = (panel: 'notes' | 'summary') => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const actionButtonClass = (active: boolean) =>
    `relative inline-flex items-center justify-center gap-1.5 min-h-10 min-w-10 px-3 sm:min-h-0 sm:min-w-0 sm:p-1.5 rounded-lg border border-line sm:border-transparent transition-colors ${
      active
        ? 'text-accent-dark bg-accent-soft'
        : 'text-muted hover:text-accent-dark hover:bg-accent-soft'
    }`;

  const getIcon = () => {
    switch (resource.type) {
      case 'case-study':
        return <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'video':
        return <Video className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'playlist':
        return <ListVideo className="w-3.5 h-3.5" aria-hidden="true" />;
      case 'article':
      default:
        return <FileText className="w-3.5 h-3.5" aria-hidden="true" />;
    }
  };

  const getTypeLabel = () => {
    switch (resource.type) {
      case 'case-study':
        return 'Case Study';
      case 'video':
        return 'Video';
      case 'playlist':
        return 'Playlist';
      case 'article':
      default:
        return 'Article';
    }
  };

  const isExternalLink = resource.url && resource.url !== '#' && /^https?:\/\//i.test(resource.url);

  return (
    <GlowCard
      glow={glow}
      id={`resource-${resource.id}`}
      className={`group relative flex flex-col justify-between gap-3 p-4 rounded-card border scroll-mt-24 transition-all duration-200 ${
        completed
          ? 'bg-paper border-line text-muted'
          : glow
          ? 'bg-surface border-line'
          : 'bg-surface border-line hover:border-ink hover:shadow-offset'
      }`}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-start gap-3 flex-1 min-w-0">
        {/* Animated Checkbox: padded hit area on phones, same visual box everywhere */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleCompleted(resource.id);
          }}
          className="group/check flex-shrink-0 -m-2.5 p-2.5 sm:m-0 sm:p-0 rounded-xl"
          aria-label={`Mark "${resource.title}" as ${completed ? 'incomplete' : 'complete'}`}
        >
          <span
            className={`mt-0.5 w-5 h-5 rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center ${
              completed
                ? 'bg-accent border-accent text-paper animate-pop'
                : 'border-ink/50 group-hover/check:border-ink bg-surface'
            }`}
          >
            {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </span>
        </button>

        {/* Resource Details & Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs sm:text-[10px]">
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border border-ink/60 text-ink`}>
              {getIcon()}
              <span>{getTypeLabel()}</span>
            </span>

            {showWeekBadge && resource.weekId && (
              <span className="font-semibold px-2 py-0.5 rounded-md text-muted border border-line uppercase">
                {resource.weekId.replace('-', ' ')}
              </span>
            )}

            {resource.isCustom && (
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-ink border border-ink/60">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                Custom
              </span>
            )}

            {resource.badge && (
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-accent-soft text-accent-dark border border-accent/40">
                {resource.badge}
              </span>
            )}
          </div>

          {/* Title Header */}
          {isExternalLink ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`font-semibold text-[15px] sm:text-sm leading-snug py-1 -my-1 hover:text-accent-dark transition-colors inline-flex items-center gap-1.5 ${
                completed
                  ? 'line-through text-muted font-normal'
                  : 'text-ink'
              }`}
            >
              <span>{resource.title}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <h4
              className={`font-semibold text-sm ${
                completed
                  ? 'line-through text-muted font-normal'
                  : 'text-ink'
              }`}
            >
              {resource.title}
            </h4>
          )}

          {/* Summary / Notes */}
          {resource.summary && (
            <p className="text-xs text-muted leading-relaxed font-normal">
              {resource.summary}
            </p>
          )}

          {resource.notes && !resource.summary && (
            <p className="text-xs text-muted italic">
              &quot;{resource.notes}&quot;
            </p>
          )}

          {/* Expandable Takeaways & Further Reading for Case Studies */}
          {((resource.takeaways && resource.takeaways.length > 0) || (resource.furtherReading && resource.furtherReading.length > 0)) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTakeawaysExpanded(!takeawaysExpanded);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-dark hover:underline min-h-10 sm:min-h-0 py-1"
              >
                <span>
                  {takeawaysExpanded
                    ? 'Hide Takeaways'
                    : `Key Takeaways (${resource.takeaways?.length || 0})`}
                </span>
                {takeawaysExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {takeawaysExpanded && (
                <div className="mt-2 space-y-3">
                  {resource.takeaways && resource.takeaways.length > 0 && (
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted border-l-2 border-accent/40 ml-1 py-1">
                      {resource.takeaways.map((takeaway, idx) => (
                        <li key={idx} className="leading-relaxed pl-1">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  )}

                  {resource.furtherReading && resource.furtherReading.length > 0 && (
                    <div className="pt-2.5 border-t border-line">
                      <span className="text-xs sm:text-[10px] font-bold uppercase tracking-wider text-accent-dark block mb-1.5">
                        Go deeper
                      </span>
                      <div className="space-y-1.5">
                        {resource.furtherReading.map((item, idx) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/80 hover:text-accent-dark transition-colors group/link py-1.5 sm:py-0"
                          >
                            <span className="hover:underline">{item.title}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover/link:opacity-100 text-accent-dark transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions: AI summary, notes, delete. Phones: labelled row along the bottom; larger screens: icons top-right */}
        <div className="order-last basis-full sm:order-none sm:basis-auto flex items-center justify-end gap-2 sm:gap-0.5 sm:self-start flex-shrink-0">

          {summaryPoints && summaryPoints.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePanel('summary');
              }}
              className={actionButtonClass(openPanel === 'summary')}
              title="AI summary"
              aria-label={`Show AI summary of "${resource.title}"`}
              aria-expanded={openPanel === 'summary'}
            >
              <WandSparkles className="w-4 h-4" />
              <span className="sm:hidden text-xs font-semibold">Summary</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePanel('notes');
            }}
            className={actionButtonClass(openPanel === 'notes')}
            title={hasNote ? 'View your notes' : 'Add notes'}
            aria-label={`${hasNote ? 'View' : 'Add'} notes for "${resource.title}"`}
            aria-expanded={openPanel === 'notes'}
          >
            <PenLine className="w-4 h-4" />
            <span className="sm:hidden text-xs font-semibold">Notes</span>
            {hasNote && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
            )}
          </button>

          {resource.isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCustomResource(resource.id);
              }}
              className="inline-flex items-center justify-center min-h-10 min-w-10 sm:min-h-0 sm:min-w-0 sm:p-1.5 rounded-lg border border-line sm:border-transparent text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Delete custom resource"
              aria-label="Delete resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown panel: stops clicks so parent click handlers (e.g. dashboard card) don't fire */}
      {openPanel && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pt-3 border-t border-line animate-fade-in cursor-auto"
        >
          {openPanel === 'notes' ? (
            <NotesPanel resourceId={resource.id} onClose={() => setOpenPanel(null)} />
          ) : (
            summaryPoints && <SummaryPanel points={summaryPoints} />
          )}
        </div>
      )}
    </GlowCard>
  );
};
