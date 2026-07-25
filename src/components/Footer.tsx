'use client';

import React from 'react';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-8 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">ProdPath</span>
          <span>&bull;</span>
          <span>Personal 4-Week Product Management Tracker</span>
        </div>

        <div>
          <span>Local Progress Storage &bull; Self-Hosted</span>
        </div>
      </div>
    </footer>
  );
};
