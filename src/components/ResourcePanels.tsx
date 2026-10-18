'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { Check, Lightbulb, AlignLeft } from 'lucide-react';

const MAX_NOTE_LENGTH = 5000;

interface NotesPanelProps {
  resourceId: string;
  onClose: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ resourceId, onClose }) => {
  const { getNote, saveNote } = useProgress();
  const savedNote = getNote(resourceId);
  const [draft, setDraft] = useState(savedNote);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, []);

  const isDirty = draft.trim() !== savedNote;

  const handleSave = async () => {
    if (!isDirty || status === 'saving') return;
    setStatus('saving');
    const ok = await saveNote(resourceId, draft);
    setStatus(ok ? 'saved' : 'error');
  };

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (status !== 'saving') setStatus('idle');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
          } else if (e.key === 'Escape') {
            onClose();
          }
        }}
        maxLength={MAX_NOTE_LENGTH}
        rows={4}
        placeholder="Jot down your key points from this resource..."
        className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-base sm:text-xs text-ink placeholder:text-muted leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-[10px] text-muted">
          {status === 'error' ? (
            <span className="text-danger">Couldn&apos;t save. Please try again.</span>
          ) : status === 'saved' && !isDirty ? (
            <span className="inline-flex items-center gap-1 text-success">
              <Check className="w-3 h-3" /> Saved
            </span>
          ) : (
            <span className="hidden sm:inline">Ctrl + Enter to save</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 sm:min-h-0 px-4 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:bg-line/40 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || status === 'saving'}
            className="min-h-10 sm:min-h-0 px-5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-dark text-paper hover:bg-accent-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskHeaderProps {
  label: string;
  summary?: string;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ label, summary }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-[10px] font-semibold uppercase tracking-wider text-muted block">
          {label}
        </span>
        {summary && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={`inline-flex items-center gap-1.5 min-h-10 px-3 sm:min-h-0 sm:gap-1 sm:px-2 sm:py-1 rounded-lg text-xs sm:text-[10px] font-semibold transition-colors ${
              open
                ? 'text-accent-dark bg-accent-soft'
                : 'text-muted hover:text-accent-dark hover:bg-accent-soft'
            }`}
            title="Overview of this task"
            aria-label={`Overview of ${label}`}
            aria-expanded={open}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
        )}
      </div>
      {open && summary && (
        <p className="text-xs text-muted leading-relaxed border-l-2 border-accent/40 pl-3 py-1 animate-fade-in">
          {summary}
        </p>
      )}
    </div>
  );
};

interface SummaryPanelProps {
  points: string[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ points }) => (
  <div className="space-y-2">
    <span className="inline-flex items-center gap-1.5 text-xs sm:text-[10px] font-bold uppercase tracking-wider text-accent-dark">
      <Lightbulb className="w-3 h-3" />
      Key takeaways
    </span>
    <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted border-l-2 border-accent/40 ml-1 py-1">
      {points.map((point, idx) => (
        <li key={idx} className="leading-relaxed pl-1">
          {point}
        </li>
      ))}
    </ul>
  </div>
);
