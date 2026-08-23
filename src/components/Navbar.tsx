'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Compass, LayoutDashboard, BookOpen, Calendar, BookMarked, Video, Menu, X, ShieldAlert, LogIn, LogOut, MessageSquare, User as UserIcon } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut, isLoadingAuth, openFeedbackModal } = useProgress();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/course', label: 'Curriculum', icon: BookOpen },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/resources', label: 'Case Studies', icon: BookMarked },
    { href: '/live-sessions', label: 'Live Sessions', icon: Video },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-[#0a0a0f]/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-zinc-900 dark:text-white flex items-center gap-1.5">
                ProdPath
              </span>
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wide text-violet-600 dark:text-violet-400 block -mt-0.5">
                Personal Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items (Only shown for authenticated users) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={openFeedbackModal}
              title="Send Feedback"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 border border-transparent hover:border-violet-200 dark:hover:border-violet-800/40 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            <ThemeToggle />

            {!isLoadingAuth && (
              <>
                {user ? (
                  <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate">
                        {userDisplayName}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[120px]">
                        {user.email}
                      </span>
                    </div>

                    <button
                      onClick={signOut}
                      title="Sign Out"
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      aria-label="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 py-1.5 px-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0a0a0f]/95 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {user && (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-violet-500" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openFeedbackModal();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
          >
            <MessageSquare className="w-4 h-4 text-violet-500" />
            <span>Send Feedback</span>
          </button>

          {!user ? (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors text-left"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </Link>
          ) : (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="px-4 py-2 text-xs text-zinc-500">
                Signed in as <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

