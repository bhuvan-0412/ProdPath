'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';

// The one sign-in action on the landing page (same Google OAuth flow as before). The Supabase client is
// loaded on demand so it isn't part of the page's first download (ProgressContext has usually loaded it already).
export const signInWithGoogle = async () => {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
  }
};

// Client-side fallback redirect for authenticated users (the middleware handles it first)
export const SignedInRedirect: React.FC = () => {
  const { user, isLoadingAuth } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoadingAuth, router]);

  return null;
};

const GoogleLogo = () => (
  <svg className="w-5 h-5 bg-white rounded-full p-0.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

interface GoogleButtonProps {
  // "onDark" is for the ink-colored call-to-action band, where a cream button keeps AA contrast
  variant?: 'primary' | 'onDark';
  className?: string;
}

export const GoogleSignInButton: React.FC<GoogleButtonProps> = ({ variant = 'primary', className = '' }) => {
  const styles =
    variant === 'onDark'
      ? 'bg-[#F6F1E7] text-[#1F2430] hover:bg-white focus-visible:outline-[#F6F1E7]'
      : 'bg-accent-dark text-paper hover:bg-accent-dark/90';

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className={`inline-flex items-center justify-center gap-3 h-12 px-6 rounded-lg text-[15px] font-semibold transition-colors ${styles} ${className}`}
    >
      <GoogleLogo />
      <span>Continue with Google</span>
    </button>
  );
};

