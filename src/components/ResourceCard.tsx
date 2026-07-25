'use client';

import React from 'react';
import { Resource } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { Video, FileText, ListVideo, ExternalLink, Check, Trash2, Sparkles } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  showWeekBadge?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, showWeekBadge = false }) => {
  const { isCompleted, toggleCompleted, deleteCustomResource } = useProgress();
  const completed = isCompleted(resource.id);

  const getIcon = () => {
    switch (resource.type) {
      case 'video':
        return <Video className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
      case 'playlist':
        return <ListVideo className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
      case 'article':
      default:
        return <FileText className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (resource.type) {
      case 'video':
        return 'Video';
      case 'playlist':
        return 'Playlist';
      case 'article':
      default:
        return 'Article';
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
        completed
          ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
          : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        {/* Animated Checkbox */}
        <button
          onClick={() => toggleCompleted(resource.id)}
          className={`flex-shrink-0 mt-0.5 sm:mt-0 w-6 h-6 rounded-lg border transition-all duration-200 flex items-center justify-center ${
            completed
              ? 'bg-emerald-500 border-emerald-500 text-white animate-pop shadow-xs'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-800'
          }`}
          aria-label={`Mark "${resource.title}" as ${completed ? 'incomplete' : 'complete'}`}
        >
          {completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Resource Title & Metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">
              {getIcon()}
              <span>{getTypeLabel()}</span>
            </span>

            {showWeekBadge && resource.weekId && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                {resource.weekId.replace('-', ' ').toUpperCase()}
              </span>
            )}

            {resource.isCustom && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Custom
              </span>
            )}
          </div>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5 line-clamp-2 ${
              completed
                ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            <span>{resource.title}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>

          {resource.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-1">
              "{resource.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {resource.isCustom && (
          <button
            onClick={() => deleteCustomResource(resource.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
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
