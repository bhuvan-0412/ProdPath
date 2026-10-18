import React from 'react';

// Placeholder block shown while a page's data loads: a soft paper-2 shape that pulses gently
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`rounded-card bg-paper-2 animate-pulse-subtle ${className}`} />
);

// A heading and a grid of card-shaped blocks, for full-page loading states
export const PageSkeleton: React.FC<{ cards?: number; label?: string }> = ({ cards = 4, label = 'Loading' }) => (
  <div role="status" aria-label={label} className="space-y-6">
    <Skeleton className="h-9 w-56" />
    <Skeleton className="h-11 w-full max-w-2xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: cards }, (_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  </div>
);
