'use client';

import React from 'react';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-[#0a0a0f]/40 py-8 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-zinc-800 dark:text-zinc-200">ProdPath</span>
          <span>&bull;</span>
          <span>Personal 4-Week Product Management Tracker</span>
        </div>

        <div className="font-mono text-[11px]">
          <span>Cloud Synced &bull; Guest Mode</span>
        </div>
      </div>
    </footer>
  );
};
