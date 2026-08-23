'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { createClient } from '@/lib/supabase/client';
import BorderGlow from '@/components/BorderGlow';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Video,
  CheckCircle2,
  TrendingUp,
  BookMarked,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Compass,
  Lock,
  Play,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const { user, isLoadingAuth } = useProgress();
  const router = useRouter();

  // Client-side fallback redirect for authenticated users
  useEffect(() => {
    if (!isLoadingAuth && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoadingAuth, router]);

  const handleGoogleLogin = async () => {
    try {
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

  return (
    <div className="space-y-16 py-4 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border border-violet-500/20 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-mono font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Personal Product Management Roadmap</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Master Product Management <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              in 5 Structured Weeks
            </span>
          </h1>

          <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            ProdPath is your personal product management learning hub and progress tracker. Track daily tasks, analyze real-world case studies, watch executive masterclasses, and build product intuition.
          </p>

          {/* Call To Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
              <span>Sign in with Google</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-semibold transition-all flex items-center justify-center"
            >
              Log In to Account
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Free &amp; Cloud Synced
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-violet-400" />
              Curated Curriculum
            </span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-zinc-100">
            Everything you need to master Product Management
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Designed for aspiring and practicing PMs to build core competencies through deliberate daily practice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-violet-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
              5-Week Curriculum
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Step-by-step daily guides covering PM foundations, product sense, system design, metrics, &amp; execution.
            </p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
              Traditional &amp; AI PM
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              A full 5-week roadmap spanning PM foundations through evals, responsible AI, and AI PM interview prep.
            </p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
              Real-World Case Studies
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Deconstruct tech breakdowns, strategy teardowns, and key executive decision patterns from top tech products.
            </p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
              Speaker Masterclasses
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Watch curated talks and recordings from experienced product leaders and domain experts.
            </p>
          </div>

          <div className="bg-white dark:bg-[#12121a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100">
              Cloud Progress Sync
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Track completion dates, save custom resources, and resume your sequence seamlessly across devices.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Curriculum Preview Mockup */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase font-bold text-violet-600 dark:text-violet-400">
            Curriculum Preview
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-zinc-100">
            Inside the 5-Week Program
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A static preview of the structured modules and daily topics inside ProdPath.
          </p>
        </div>

        {/* Mockup Container */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-[11px] font-mono">
            <Lock className="w-3 h-3" />
            <span>Interactive view unlocks on login</span>
          </div>

          {/* Sample Week Tabs Mock */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-800/80 shadow-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-violet-600 dark:text-violet-300">
                Week 1
              </span>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                PM Foundations
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 block mt-2">7 Topics</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 opacity-80">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                Week 2
              </span>
              <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                Product Sense &amp; Strategy
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 block mt-2">6 Topics</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 opacity-80">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                Week 3
              </span>
              <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                Metrics &amp; System Design
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 block mt-2">8 Topics</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 opacity-80">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                Week 4
              </span>
              <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                Execution &amp; Teardowns
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 block mt-2">5 Topics</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 opacity-80 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                Week 5
              </span>
              <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 mt-1 truncate">
                Leadership &amp; Career
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 block mt-2">6 Topics</span>
            </div>
          </div>

          {/* Sample Day Card Preview */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white font-mono font-bold text-xs">
                Day 1 Sample
              </span>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Introduction to Product Management &amp; Core Frameworks
              </h4>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      What is Product Management &amp; Roles of a PM
                    </h5>
                    <span className="text-[10px] font-mono text-zinc-400">Article &bull; IBM PM Guide</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Preview
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#12121a] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      Product Sense: Building Intuition Over Time
                    </h5>
                    <span className="text-[10px] font-mono text-zinc-400">Video &bull; Lenny&apos;s Newsletter</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Sign In CTA Section */}
      <section className="bg-gradient-to-r from-violet-900/40 via-purple-950/30 to-zinc-950 rounded-3xl p-8 sm:p-12 border border-violet-500/30 text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white">
            Ready to start your Product Management journey?
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base">
            Sign in with Google to unlock full access to the 5-week curriculum, case study repository, speaker masterclasses, and cloud progress tracking.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
            <span>Sign in with Google</span>
          </button>
        </div>
      </section>
    </div>
  );
}
