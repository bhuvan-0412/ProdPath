'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut, isLoadingAuth, openFeedbackModal } = useProgress();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/course', label: 'Curriculum' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/resources', label: 'Case Studies' },
    { href: '/live-sessions', label: 'Live Sessions' },
  ];

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = userDisplayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand */}
          <Link
            href={user ? '/dashboard' : '/'}
            className="font-display text-xl font-semibold text-ink tracking-tight rounded-md"
          >
            ProdPath
          </Link>

          {/* Desktop links (signed-in users only) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-3 py-2 text-sm rounded-md transition-colors border-b-2 ${
                      active
                        ? 'text-ink font-semibold border-accent rounded-b-none'
                        : 'text-muted font-medium border-transparent hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right side: feedback, theme, account */}
          <div className="flex items-center gap-2">
            <button
              onClick={openFeedbackModal}
              title="Send Feedback"
              className="hidden md:inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </button>

            <ThemeToggle />

            {!isLoadingAuth && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent-dark font-display font-semibold text-sm border border-line"
                      title={`${userDisplayName} (${user.email})`}
                      aria-label={`Signed in as ${userDisplayName}`}
                    >
                      {initial}
                    </span>
                    <button
                      onClick={signOut}
                      title="Sign Out"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-ink transition-colors"
                      aria-label="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 whitespace-nowrap bg-accent-dark hover:bg-accent-dark/90 text-paper rounded-lg text-sm font-semibold transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-line text-ink"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-4 pt-2 pb-4 space-y-1">
          {user &&
            navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center px-3 py-3 rounded-lg text-base border-l-2 ${
                    active ? 'text-ink font-semibold border-accent bg-surface' : 'text-muted font-medium border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openFeedbackModal();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted text-left"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Feedback</span>
          </button>

          {!user ? (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-semibold bg-accent-dark text-paper"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </Link>
          ) : (
            <div className="pt-2 mt-2 border-t border-line">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-soft text-accent-dark font-display font-semibold text-sm border border-line">
                  {initial}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{userDisplayName}</div>
                  <div className="text-xs text-muted truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-danger"
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
