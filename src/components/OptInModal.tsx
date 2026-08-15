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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={handleSubmit}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Stay Up to Date
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personalized updates & new content alerts
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
          Want occasional emails about new Product Management content, curriculum updates, and resources?
        </p>

        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mb-6">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-violet-600 rounded border-zinc-300 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-700"
          />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Yes, send me occasional email updates about ProdPath.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Preference'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
