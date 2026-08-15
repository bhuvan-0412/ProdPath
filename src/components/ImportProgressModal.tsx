'use client';

import React, { useState } from 'react';
import { Database, Check, X, ArrowUpRight } from 'lucide-react';

interface ImportProgressModalProps {
  completedCount: number;
  customCount: number;
  onImport: () => Promise<void>;
  onSkip: () => void;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  completedCount,
  customCount,
  onImport,
  onSkip,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsImporting(true);
      await onImport();
    } catch (err) {
      console.error('Failed to import progress:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors"
          aria-label="Skip import"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Import Existing Progress?
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Found local guest activity on this device
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
          We noticed you have local progress stored in your browser. Would you like to import it into your account?
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
            <span>Completed resources:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount} items</span>
          </div>
          {customCount > 0 && (
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300">
              <span>Custom resources:</span>
              <span className="font-bold text-violet-600 dark:text-violet-400">{customCount} items</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onSkip}
            disabled={isImporting}
            className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            Skip for Now
          </button>
          <button
            onClick={handleConfirm}
            disabled={isImporting}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              'Importing...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Import Progress</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
