'use client';

import React, { useState } from 'react';
import { Mail, Check, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface OptInModalProps {
  userId: string;
  onClose: () => void;
}

export const OptInModal: React.FC<OptInModalProps> = ({ userId, onClose }) => {
  const [optIn, setOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      await supabase
        .from('profiles')
        .update({
          marketing_opt_in: optIn,
          has_seen_opt_in: true,
        })
        .eq('id', userId);

      onClose();
    } catch (err) {
      console.error('Error saving opt-in preference:', err);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="bg-surface border border-line rounded-xl p-6 sm:p-8 max-w-md w-full relative">
        <button
          onClick={handleSubmit}
          className="absolute top-4 right-4 p-2 text-muted hover:text-ink rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent-dark">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-display font-semibold text-ink">
              Stay Up to Date
            </h2>
            <p className="text-xs text-muted">
              Personalized updates & new content alerts
            </p>
          </div>
        </div>

        <p className="text-xs text-muted mb-6 leading-relaxed">
          Want occasional emails about new Product Management content, curriculum updates, and resources?
        </p>

        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-paper border border-line cursor-pointer hover:bg-line/40 transition-colors mb-6">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-accent rounded border-line"
          />
          <span className="text-xs font-medium text-ink/80">
            Yes, send me occasional email updates about ProdPath.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-accent-dark hover:bg-accent-dark/90 text-paper font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Preference'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
