'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LogIn, ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import Link from 'next/link';
import { PageBackdrop } from '@/components/PageBackdrop';
import { PageIcons } from '@/components/decor/BackgroundIcons';
import { LOGIN_ICONS } from '@/components/decor/iconLayouts';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <>
    <PageBackdrop variant="contours" />
    <PageIcons icons={LOGIN_ICONS} />
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent-dark transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-surface border border-line rounded-card p-8">
          <div className="text-center mb-8">
            <LogoMark size={48} className="block mx-auto mb-4" />
            <h1 className="text-3xl font-display font-semibold tracking-tight text-ink mb-2">
              Welcome to ProdPath
            </h1>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Sign in to synchronize your learning progress across devices, save custom resources, and pick up your learning path where you left off.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs font-medium text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-surface hover:bg-line/40 text-ink border border-line rounded-xl font-semibold text-sm hover:shadow-offset transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              {!loading && <LogIn className="w-4 h-4 text-muted group-hover:text-accent-dark transition-colors" />}
            </button>
          </div>

          <p className="text-xs sm:text-[11px] text-muted text-center mt-6">
            By signing in, you agree to our{' '}
            <Link href="/privacy" className="font-semibold text-accent-dark underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
