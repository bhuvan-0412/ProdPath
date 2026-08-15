'use client';

import React, { useState } from 'react';
import { Resource } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { Video, FileText, ListVideo, ExternalLink, Check, Trash2, Sparkles, BookMarked, ChevronDown, ChevronUp } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  showWeekBadge?: boolean;
  defaultExpandedTakeaways?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  showWeekBadge = false,
  defaultExpandedTakeaways = false,
}) => {
  const { isCompleted, toggleCompleted, deleteCustomResource } = useProgress();
  const completed = isCompleted(resource.id);
  const [takeawaysExpanded, setTakeawaysExpanded] = useState(defaultExpandedTakeaways);

  const getIcon = () => {
    switch (resource.type) {
      case 'case-study':
        return <BookMarked className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />;
      case 'playlist':
        return <ListVideo className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />;
      case 'article':
      default:
        return <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />;
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

  const getTypeBadgeClass = () => {
    switch (resource.type) {
      case 'case-study':
        return 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/50';
      case 'video':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50';
      case 'playlist':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50';
      case 'article':
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/60 dark:border-zinc-700/50';
    }
  };

  const isExternalLink = resource.url && resource.url !== '#' && /^https?:\/\//i.test(resource.url);

  return (
    <div
      className={`group relative flex flex-col justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
        completed
          ? 'bg-zinc-50/70 dark:bg-[#12121a]/50 border-zinc-200/80 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400'
          : 'bg-white dark:bg-[#12121a] border-zinc-200/90 dark:border-zinc-800 hover:border-violet-500/40 dark:hover:border-violet-500/40 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Animated Checkbox */}
        <button
          onClick={() => toggleCompleted(resource.id)}
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
            completed
              ? 'bg-violet-600 border-violet-600 text-white animate-pop shadow-xs'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-violet-400 bg-zinc-50 dark:bg-zinc-900'
          }`}
          aria-label={`Mark "${resource.title}" as ${completed ? 'incomplete' : 'complete'}`}
        >
          {completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Resource Details & Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Metadata Badges */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-[10px]">
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border ${getTypeBadgeClass()}`}>
              {getIcon()}
              <span>{getTypeLabel()}</span>
            </span>

            {showWeekBadge && resource.weekId && (
              <span className="font-semibold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50 uppercase">
                {resource.weekId.replace('-', ' ')}
              </span>
            )}

            {resource.isCustom && (
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Custom
              </span>
            )}

            {resource.badge && (
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
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
              className={`font-semibold text-sm hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-flex items-center gap-1.5 ${
                completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <span>{resource.title}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            <h4
              className={`font-semibold text-sm ${
                completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {resource.title}
            </h4>
          )}

          {/* Summary / Notes */}
          {resource.summary && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              {resource.summary}
            </p>
          )}

          {resource.notes && !resource.summary && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
              &quot;{resource.notes}&quot;
            </p>
          )}

          {/* Expandable Takeaways & Further Reading for Case Studies */}
          {((resource.takeaways && resource.takeaways.length > 0) || (resource.furtherReading && resource.furtherReading.length > 0)) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setTakeawaysExpanded(!takeawaysExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors py-1"
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
                    <ul className="space-y-1.5 pl-4 list-disc text-xs text-zinc-600 dark:text-zinc-300 border-l-2 border-violet-500/30 ml-1 py-1">
                      {resource.takeaways.map((takeaway, idx) => (
                        <li key={idx} className="leading-relaxed pl-1">
                          {takeaway}
                        </li>
                      ))}
                    </ul>
                  )}

                  {resource.furtherReading && resource.furtherReading.length > 0 && (
                    <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 block mb-1.5">
                        Go deeper
                      </span>
                      <div className="space-y-1.5">
                        {resource.furtherReading.map((item, idx) => (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors group/link"
                          >
                            <span className="hover:underline">{item.title}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover/link:opacity-100 text-violet-500 transition-opacity" />
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

        {/* Delete button for custom additions */}
        {resource.isCustom && (
          <button
            onClick={() => deleteCustomResource(resource.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors self-start"
            title="Delete custom resource"
            aria-label="Delete resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
