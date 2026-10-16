'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/context/ProgressContext';
import { createClient } from '@/lib/supabase/client';
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
      <section className="relative overflow-hidden rounded-xl bg-surface border border-line p-8 sm:p-12 text-ink">
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft border border-accent/40 text-accent-dark text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-marigold animate-pulse" />
            <span>Personal Product Management Roadmap</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-semibold tracking-tight text-ink leading-tight sm:leading-none">
            Master Product Management <br />
            <span className="text-accent-dark">
              in 5 Structured Weeks
            </span>
          </h1>

          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            ProdPath is your personal product management learning hub and progress tracker. Track daily tasks, analyze real-world case studies, watch executive masterclasses, and build product intuition.
          </p>

          {/* Call To Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-accent-dark hover:bg-accent-dark/90 text-paper font-bold text-sm transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 bg-surface rounded-full p-0.5" viewBox="0 0 24 24">
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
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-transparent hover:bg-ink/5 border border-ink text-ink text-sm font-semibold transition-all flex items-center justify-center"
            >
              Log In to Account
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-success" />
              100% Free &amp; Cloud Synced
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-accent-dark" />
              Curated Curriculum
            </span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Everything you need to master Product Management
          </h2>
          <p className="text-sm text-muted">
            Designed for aspiring and practicing PMs to build core competencies through deliberate daily practice.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <div className="bg-surface rounded-xl p-6 border border-line space-y-3 hover:border-accent transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-ink">
              5-Week Curriculum
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Step-by-step daily guides covering PM foundations, product sense, system design, metrics, &amp; execution.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-line space-y-3 hover:border-success/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-ink">
              Traditional &amp; AI PM
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              A full 5-week roadmap spanning PM foundations through evals, responsible AI, and AI PM interview prep.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-line space-y-3 hover:border-accent transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-ink">
              Real-World Case Studies
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Deconstruct tech breakdowns, strategy teardowns, and key executive decision patterns from top tech products.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-line space-y-3 hover:border-accent transition-all">
            <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-dark flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-ink">
              Speaker Masterclasses
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Watch curated talks and recordings from experienced product leaders and domain experts.
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-line space-y-3 hover:border-marigold/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-marigold/15 text-ink flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-ink">
              Cloud Progress Sync
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Track completion dates, save custom resources, and resume your sequence seamlessly across devices.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Curriculum Preview Mockup */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase font-bold text-accent-dark">
            Curriculum Preview
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
            Inside the 5-Week Program
          </h2>
          <p className="text-sm text-muted">
            A static preview of the structured modules and daily topics inside ProdPath.
          </p>
        </div>

        {/* Mockup Container */}
        <div className="relative overflow-hidden rounded-xl bg-surface border border-line p-6 sm:p-8 space-y-6">
          <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft border border-accent/40 text-accent-dark text-xs sm:text-[11px] font-mono">
            <Lock className="w-3 h-3" />
            <span>Interactive view unlocks on login</span>
          </div>

          {/* Sample Week Tabs Mock */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-accent-soft border border-accent/40 ">
              <span className="text-xs sm:text-[10px] font-mono font-bold uppercase text-accent-dark">
                Week 1
              </span>
              <h4 className="font-bold text-xs text-ink mt-1 truncate">
                PM Foundations
              </h4>
              <span className="text-xs sm:text-[10px] font-mono text-muted block mt-2">7 Topics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line opacity-80">
              <span className="text-xs sm:text-[10px] font-mono font-bold uppercase text-muted">
                Week 2
              </span>
              <h4 className="font-bold text-xs text-ink/80 mt-1 truncate">
                Product Sense &amp; Strategy
              </h4>
              <span className="text-xs sm:text-[10px] font-mono text-muted block mt-2">6 Topics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line opacity-80">
              <span className="text-xs sm:text-[10px] font-mono font-bold uppercase text-muted">
                Week 3
              </span>
              <h4 className="font-bold text-xs text-ink/80 mt-1 truncate">
                Metrics &amp; System Design
              </h4>
              <span className="text-xs sm:text-[10px] font-mono text-muted block mt-2">8 Topics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line opacity-80">
              <span className="text-xs sm:text-[10px] font-mono font-bold uppercase text-muted">
                Week 4
              </span>
              <h4 className="font-bold text-xs text-ink/80 mt-1 truncate">
                Execution &amp; Teardowns
              </h4>
              <span className="text-xs sm:text-[10px] font-mono text-muted block mt-2">5 Topics</span>
            </div>

            <div className="p-3.5 rounded-xl bg-paper border border-line opacity-80 col-span-2 sm:col-span-1">
              <span className="text-xs sm:text-[10px] font-mono font-bold uppercase text-muted">
                Week 5
              </span>
              <h4 className="font-bold text-xs text-ink/80 mt-1 truncate">
                Leadership &amp; Career
              </h4>
              <span className="text-xs sm:text-[10px] font-mono text-muted block mt-2">6 Topics</span>
            </div>
          </div>

          {/* Sample Day Card Preview */}
          <div className="bg-paper rounded-xl p-5 border border-line space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-line">
              <span className="px-2.5 py-1 rounded-lg bg-accent-dark text-paper font-mono font-bold text-xs">
                Day 1 Sample
              </span>
              <h4 className="font-bold text-ink text-sm">
                Introduction to Product Management &amp; Core Frameworks
              </h4>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent-dark flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-ink">
                      What is Product Management &amp; Roles of a PM
                    </h5>
                    <span className="text-xs sm:text-[10px] font-mono text-muted">Article &bull; IBM PM Guide</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs sm:text-[10px] font-mono bg-paper text-muted">
                  Preview
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-accent-soft text-accent-dark flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-ink">
                      Product Sense: Building Intuition Over Time
                    </h5>
                    <span className="text-xs sm:text-[10px] font-mono text-muted">Video &bull; Lenny&apos;s Newsletter</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs sm:text-[10px] font-mono bg-paper text-muted">
                  Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Sign In CTA Section */}
      <section className="rounded-xl p-8 sm:p-12 bg-surface border border-line text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-display font-semibold text-ink">
            Ready to start your Product Management journey?
          </h2>
          <p className="text-muted text-sm sm:text-base">
            Sign in with Google to unlock full access to the 5-week curriculum, case study repository, speaker masterclasses, and cloud progress tracking.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="px-8 py-4 rounded-xl bg-accent-dark hover:bg-accent-dark/90 text-paper font-bold text-sm transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5 bg-surface rounded-full p-0.5" viewBox="0 0 24 24">
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
