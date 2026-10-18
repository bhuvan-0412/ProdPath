'use client';

import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';

// Sends signed-in visitors to their dashboard and everyone else to the landing page
export const BackHomeButton: React.FC = () => {
  const { user, isLoadingAuth } = useProgress();
  const signedIn = !isLoadingAuth && Boolean(user);
  return (
    <Link
      href={signedIn ? '/dashboard' : '/'}
      className="inline-flex items-center justify-center min-h-11 px-5 rounded-full bg-accent-dark hover:bg-accent-dark/90 text-paper text-sm font-semibold transition-colors"
    >
      {signedIn ? 'Back to your dashboard' : 'Back to the start'}
    </Link>
  );
};
