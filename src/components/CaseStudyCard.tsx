'use client';

import React, { useId, useState } from 'react';
import { Resource } from '@/types/curriculum';
import { useProgress } from '@/context/ProgressContext';
import { NotesPanel } from '@/components/ResourcePanels';
import { GlowCard } from '@/components/GlowCard';
import { SearchDocIcon } from '@/components/landing/Illustrations';
import { Check, ChevronDown, ExternalLink, PenLine, Trash2 } from 'lucide-react';

// One case study on the Case Studies page: an illustrated mark, title, week tag, a summary clamped to two
// lines and the completion checkbox. Key takeaways and further reading open inside the card.
// Same progress, notes and delete actions as ResourceCard; only the layout differs.
export const CaseStudyCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const { isCompleted, toggleCompleted, deleteCustomResource, getNote } = useProgress();
  const completed = isCompleted(resource.id);
  const [open, setOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const detailsId = useId();
  const hasNote = getNote(resource.id) !== '';

  const takeaways = resource.takeaways || [];
  const reading = resource.furtherReading || [];
  const hasDetails = takeaways.length > 0 || reading.length > 0;
  const blurb = resource.summary || resource.notes;
  const weekTag = resource.weekId ? resource.weekId.replace('week-', 'Week ') : 'Case study';
  const isExternalLink = resource.url && resource.url !== '#' && /^https?:\/\//i.test(resource.url);

  const iconButton = (active: boolean) =>
    `relative inline-flex items-center justify-center min-h-10 min-w-10 sm:min-h-8 sm:min-w-8 rounded-lg transition-colors ${
      active ? 'text-accent-dark' : 'text-muted hover:text-accent-dark'
    }`;

  return (
    <GlowCard
      id={`resource-${resource.id}`}
      className={`flex flex-col rounded-card border p-5 scroll-mt-24 transition-colors ${
        completed ? 'bg-accent-soft/40 border-accent/40' : 'bg-surface border-line'
      }`}
    >
      <div className="flex items-start gap-4">
        <SearchDocIcon className="w-11 h-11 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{weekTag}</span>
            {resource.isCustom && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-line text-muted">Custom</span>
            )}
          </div>

          {isExternalLink ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-start gap-1.5 font-display text-lg font-semibold leading-snug text-ink hover:text-accent-dark transition-colors"
            >
              <span id={`resource-title-${resource.id}`}>{resource.title}</span>
              <ExternalLink className="w-3.5 h-3.5 mt-1.5 flex-shrink-0 opacity-60" aria-hidden="true" />
            </a>
          ) : (
            <h2 id={`resource-title-${resource.id}`} className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
              {resource.title}
            </h2>
          )}

          {blurb && <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-2">{blurb}</p>}
        </div>

        {/* Completion checkbox, with a padded hit area */}
        <button
          type="button"
          onClick={() => toggleCompleted(resource.id)}
          className="group/check flex-shrink-0 -m-2 p-2 rounded-xl"
          aria-pressed={completed}
          aria-label={`Mark "${resource.title}" as ${completed ? 'incomplete' : 'complete'}`}
        >
          <span
            className={`w-6 h-6 rounded-md border-[1.5px] flex items-center justify-center transition-colors ${
              completed ? 'bg-accent border-accent text-paper animate-pop' : 'border-ink/50 group-hover/check:border-ink bg-surface'
            }`}
          >
            {completed && <Check className="w-4 h-4 stroke-[3]" />}
          </span>
        </button>
      </div>

      {/* Footer: open the details, notes, delete (custom only) */}
      <div className="mt-4 pt-3 border-t border-line flex items-center gap-2">
        {hasDetails ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="inline-flex items-center gap-1.5 min-h-10 sm:min-h-8 text-sm font-semibold text-accent-dark hover:underline underline-offset-2"
          >
            {open ? 'Hide details' : 'Key takeaways & further reading'}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        ) : (
          <span className="text-sm text-muted">{completed ? 'Completed' : 'Not started'}</span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className={iconButton(notesOpen)}
            title={hasNote ? 'Your notes (saved)' : 'Your notes'}
            aria-label={hasNote ? 'Your notes, saved' : 'Your notes'}
            aria-describedby={`resource-title-${resource.id}`}
            aria-expanded={notesOpen}
          >
            <PenLine className="w-4 h-4" />
            {hasNote && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-surface" aria-hidden="true" />}
          </button>
          {resource.isCustom && (
            <button
              type="button"
              onClick={() => deleteCustomResource(resource.id)}
              className="inline-flex items-center justify-center min-h-10 min-w-10 sm:min-h-8 sm:min-w-8 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Delete custom case study"
              aria-label="Delete case study"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {open && hasDetails && (
        <div id={detailsId} className="mt-3 space-y-4 animate-fade-in">
          {takeaways.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-accent-dark">Key takeaways</h3>
              <ul className="mt-2 space-y-1.5 pl-5 list-disc marker:text-accent text-sm text-ink/85 leading-relaxed">
                {takeaways.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {reading.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-accent-dark">Further reading</h3>
              <ul className="mt-2 space-y-1">
                {reading.map((item, i) => (
                  <li key={i}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1 text-sm font-medium text-ink/85 hover:text-accent-dark transition-colors"
                    >
                      <span className="underline decoration-line underline-offset-2">{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-accent-dark opacity-70" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {notesOpen && (
        <div className="mt-3 pt-3 border-t border-line animate-fade-in">
          <NotesPanel resourceId={resource.id} onClose={() => setNotesOpen(false)} />
        </div>
      )}
    </GlowCard>
  );
};
