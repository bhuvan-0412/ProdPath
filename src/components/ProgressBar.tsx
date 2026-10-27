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
    md: 'h-2.5',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-muted">
          <span>{total !== undefined && completed !== undefined ? `${completed} of ${total} completed` : 'Progress'}</span>
          <span className="text-ink font-semibold tabular-nums">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-line rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
