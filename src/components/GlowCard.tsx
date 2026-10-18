'use client';

import React from 'react';

type GlowCardProps<T extends React.ElementType> = {
  /** Element or component to render, e.g. 'div', 'figure' or next/link's Link. Defaults to 'div'. */
  as?: T;
  className?: string;
  children?: React.ReactNode;
  /** Turn the effect off and render a plain element (for components that only glow in some places) */
  glow?: boolean;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

// A card whose border lights up in terracotta around the pointer and follows it as it moves.
// The glow itself is pure CSS (.glow-card in globals.css); this component only records where the pointer is.
// It never captures clicks: the glow layers ignore the pointer, so links, buttons and checkboxes inside work as usual.
export function GlowCard<T extends React.ElementType = 'div'>({
  as,
  className = '',
  children,
  glow = true,
  ...rest
}: GlowCardProps<T>) {
  const Component: React.ElementType = as || 'div';
  const { onPointerMove } = rest as { onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void };

  if (!glow) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    // Mouse and pen only; touch screens get no effect
    if (e.pointerType !== 'touch') {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }
    onPointerMove?.(e);
  };

  return (
    <Component {...rest} className={`glow-card ${className}`} onPointerMove={handlePointerMove}>
      {children}
    </Component>
  );
}
