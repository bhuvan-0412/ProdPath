import React from 'react';
import type { Metadata } from 'next';
import { LostTrail } from '@/components/landing/Illustrations';
import { BackHomeButton } from '@/components/BackHomeButton';
import { PageBackdrop } from '@/components/PageBackdrop';

export const metadata: Metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <>
      <PageBackdrop variant="contours" />
      <div className="animate-fade-in min-h-[60vh] flex flex-col items-center justify-center text-center py-10">
        <LostTrail className="w-full max-w-sm h-auto" />
        <h1 className="mt-8 text-3xl sm:text-4xl font-display font-semibold tracking-tight text-ink">This path doesn&rsquo;t exist.</h1>
        <div className="mt-6">
          <BackHomeButton />
        </div>
      </div>
    </>
  );
}
