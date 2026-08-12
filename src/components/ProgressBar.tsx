'use client';

import React from 'react';

interface ProgressBarProps {
  percentage: number;
  completed?: number;
  total?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  completed,
  total,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <span>{total !== undefined && completed !== undefined ? `${completed} of ${total} completed` : 'Progress'}</span>
          <span className="text-violet-600 dark:text-violet-400 font-mono font-bold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-800 ${heightClasses[size]}`}>
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-400 dark:from-violet-500 dark:via-violet-400 dark:to-indigo-300 rounded-full transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
