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
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>{total !== undefined && completed !== undefined ? `${completed} of ${total} completed` : 'Progress'}</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner ${heightClasses[size]}`}>
        <div
          className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-400 dark:from-indigo-500 dark:via-indigo-400 dark:to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
