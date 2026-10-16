'use client';

import React, { useState } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { ResourceType } from '@/types/curriculum';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWeekId?: string;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  defaultWeekId = 'week-1',
}) => {
  const { addCustomResource } = useProgress();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('article');
  const [weekId, setWeekId] = useState(defaultWeekId);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    let trimmedUrl = url.trim();

    if (!trimmedTitle || trimmedTitle.length < 2) {
      setError('Please enter a valid title (at least 2 characters)');
      return;
    }
    if (!trimmedUrl) {
      setError('Please enter a valid URL link');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = 'https://' + trimmedUrl;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError('Invalid URL format. Please enter a valid web URL (e.g., https://example.com)');
      return;
    }

    addCustomResource({
      title: trimmedTitle,
      url: trimmedUrl,
      type,
      weekId,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setTitle('');
    setUrl('');
    setType('article');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface rounded-xl border border-line overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft text-accent-dark flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-ink">Add New Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-line/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-danger bg-danger/10 rounded-lg border border-danger/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1.5">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Master Product Metrics Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-ink text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1.5">
              URL Link <span className="text-danger">*</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-ink text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1.5">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-ink text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent font-mono text-xs"
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="playlist">Playlist</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/80 mb-1.5">
                Target Week
              </label>
              <select
                value={weekId}
                onChange={(e) => setWeekId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-ink text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent font-mono text-xs"
              >
                <option value="week-1">Week 1: PM Foundations</option>
                <option value="week-2">Week 2: Metrics, MVP & Strategy</option>
                <option value="week-3">Week 3: Tech for PM + AI Tools</option>
                <option value="week-4">Week 4: PM Interview Prep</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/80 mb-1.5">
              Personal Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Great case study on AARRR framework..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-line bg-paper text-ink text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-ink text-ink hover:bg-ink/5 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-paper text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
