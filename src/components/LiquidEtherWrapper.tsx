'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LiquidEther = dynamic(() => import('@/components/LiquidEther'), {
  ssr: false,
});

export default function LiquidEtherWrapper() {
  return (
    <div className="fixed inset-0 -z-10 opacity-25 dark:opacity-20 pointer-events-none overflow-hidden">
      <LiquidEther
        colors={['#7c3aed', '#8b5cf6', '#a78bfa']}
        mouseForce={12}
        cursorSize={70}
        resolution={0.25}
        iterationsViscous={8}
        iterationsPoisson={8}
        autoDemo={true}
        autoSpeed={0.35}
        autoIntensity={1.5}
      />
    </div>
  );
}
