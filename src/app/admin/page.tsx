'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Send, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Skeleton } from '@/components/Skeleton';
import weeksData from '@/data/weeks.json';
import liveSessionsData from '@/data/liveSessions.json';
import { LIVE_SESSIONS_ENABLED } from '@/context/catalog';
import caseStudiesData from '@/data/caseStudies.json';

interface AdminUserDetail {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  completed_count: number;
  completion_percentage: number;
}

// Plain stat tile: label, big number, optional note
const StatTile: React.FC<{ label: string; value: React.ReactNode; note?: string; loading: boolean }> = ({ label, value, note, loading }) => (
  <div className="rounded-card border border-line bg-surface p-5">
    <p className="text-sm text-muted">{label}</p>
    {loading ? (
      <Skeleton className="mt-2 h-9 w-20" />
    ) : (
      <p className="mt-1 font-display text-4xl font-semibold text-ink tabular-nums leading-tight">{value}</p>
    )}
    {note && !loading && <p className="mt-1 text-xs text-muted">{note}</p>}
  </div>
);

export default function AdminPage() {
  const { user, isAdmin, isLoadingAuth } = useProgress();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [usersList, setUsersList] = useState<AdminUserDetail[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  // Ids of every built-in item (curriculum, live sessions when enabled, case studies). Completion figures only count
  // stored ticks whose id is in this set, so ticks on resources since removed from the course are ignored.
  const builtInIds = useMemo(() => {
    const ids = new Set<string>();
    weeksData.weeks.forEach((w) => {
      w.days.forEach((d) => {
        d.tasks.forEach((t) => {
          t.resources.forEach((r) => ids.add(r.id));
        });
      });
    });
    if (LIVE_SESSIONS_ENABLED) liveSessionsData.liveSessions.forEach((s) => ids.add(`live-session-${s.sessionNumber}`));
    caseStudiesData.caseStudies.forEach((cs) => ids.add(cs.id));
    return ids;
  }, []);
  const totalCurriculumResources = builtInIds.size || 1;

  // Protect route
  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user || !isAdmin) {
        router.push('/');
      }
    }
  }, [isLoadingAuth, user, isAdmin, router]);

  const loadAdminData = useCallback(async () => {
    try {
      setLoadingStats(true);
      setErrorMsg(null);

      // Fetch profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profErr) throw profErr;

      // Fetch user progress entries
      const { data: progressEntries, error: progErr } = await supabase
        .from('user_progress')
        .select('user_id, resource_id');

      if (progErr) console.warn('Could not fetch user progress details:', progErr);

      // Map distinct completed resources per user
      const progressMap = new Map<string, Set<string>>();
      (progressEntries || []).forEach((entry) => {
        if (!progressMap.has(entry.user_id)) {
          progressMap.set(entry.user_id, new Set());
        }
        if (builtInIds.has(entry.resource_id)) progressMap.get(entry.user_id)?.add(entry.resource_id);
      });

      const formatted: AdminUserDetail[] = (profiles || []).map((p) => {
        const userCompletedSet = progressMap.get(p.id) || new Set();
        const completedCount = userCompletedSet.size;
        const completion_percentage = Math.min(
          100,
          Math.round((completedCount / totalCurriculumResources) * 100)
        );

        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          is_admin: p.is_admin,
          marketing_opt_in: p.marketing_opt_in,
          created_at: p.created_at,
          completed_count: completedCount,
          completion_percentage,
        };
      });

      setUsersList(formatted);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error loading admin data:', error);
      setErrorMsg(error.message || 'Failed to load user analytics data.');
    } finally {
      setLoadingStats(false);
    }
  }, [supabase, builtInIds, totalCurriculumResources]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, loadAdminData]);

  const optedInCount = useMemo(() => {
    return usersList.filter((u) => u.marketing_opt_in).length;
  }, [usersList]);

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      setErrorMsg(null);
      setEmailSuccessMsg(null);

      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send broadcast emails.');
      }

      setEmailSuccessMsg(`Successfully sent email campaign to ${data.count} opted-in user(s)!`);
      setEmailSubject('');
      setEmailMessage('');
      setShowConfirmModal(false);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error occurred while sending email campaign.');
      setShowConfirmModal(false);
    } finally {
      setSendingEmail(false);
    }
  };

  const avgCompletion =
    usersList.length > 0 ? Math.round(usersList.reduce((acc, u) => acc + u.completion_percentage, 0) / usersList.length) : 0;
  const peopleLabel = `${optedInCount} ${optedInCount === 1 ? 'person' : 'people'}`;

  if (isLoadingAuth || (!isAdmin && user)) {
    return (
      <div role="status" aria-label="Checking admin access" className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-ink">Admin</h1>
        <button
          type="button"
          onClick={loadAdminData}
          disabled={loadingStats}
          className="self-start sm:self-auto inline-flex items-center gap-2 min-h-10 px-4 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:border-ink transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {errorMsg && (
        <div role="alert" className="p-4 rounded-card bg-danger/10 border border-danger/30 text-danger text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="p-1 hover:opacity-80" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {emailSuccessMsg && (
        <div role="status" className="p-4 rounded-card bg-success/10 border border-success/30 text-success text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{emailSuccessMsg}</span>
          </div>
          <button type="button" onClick={() => setEmailSuccessMsg(null)} className="p-1 hover:opacity-80" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Registered users" value={usersList.length} loading={loadingStats} />
        <StatTile label="Average completion" value={`${avgCompletion}%`} loading={loadingStats} />
        <StatTile
          label="Opted into emails"
          value={optedInCount}
          note={usersList.length > 0 ? `${Math.round((optedInCount / usersList.length) * 100)}% of users` : undefined}
          loading={loadingStats}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Users table: scrolls sideways inside its own box on small screens */}
        <section className="lg:col-span-2 min-w-0 rounded-card border border-line bg-surface">
          <h2 className="px-5 pt-5 pb-3 text-lg font-display font-semibold text-ink">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-y border-line bg-paper text-xs uppercase tracking-[0.08em] text-muted">
                  <th scope="col" className="py-3 px-5 font-semibold">User</th>
                  <th scope="col" className="py-3 px-3 font-semibold">Joined</th>
                  <th scope="col" className="py-3 px-3 font-semibold">Progress</th>
                  <th scope="col" className="py-3 px-5 font-semibold text-right">Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usersList.length === 0 ? (
                  loadingStats ? (
                    [0, 1, 2].map((i) => (
                      <tr key={i}>
                        <td colSpan={4} className="py-4 px-5">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-muted">
                        No registered users yet.
                      </td>
                    </tr>
                  )
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-paper/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-ink">
                          {u.full_name || 'Anonymous user'}
                          {u.is_admin && (
                            <span className="ml-2 align-middle px-2 py-0.5 rounded-full text-xs font-semibold bg-marigold/20 text-ink">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{u.email}</div>
                      </td>
                      <td className="py-4 px-3 text-muted whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-24 h-1.5 rounded-full bg-line overflow-hidden"
                            role="progressbar"
                            aria-valuenow={u.completion_percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${u.full_name || u.email} progress`}
                          >
                            <div className="h-full bg-accent rounded-full" style={{ width: `${u.completion_percentage}%` }} />
                          </div>
                          <span className="text-ink tabular-nums">{u.completion_percentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {u.marketing_opt_in ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">Yes</span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full border border-line text-muted text-xs font-semibold">No</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Email broadcast */}
        <section className="rounded-card border border-line bg-surface p-5">
          <h2 className="text-lg font-display font-semibold text-ink">Email broadcast</h2>
          <p className="mt-1 text-sm text-muted">Only goes to users who opted into emails ({peopleLabel} right now).</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (optedInCount === 0) {
                setErrorMsg('No opted-in recipients available to email.');
                return;
              }
              setShowConfirmModal(true);
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label htmlFor="broadcast-subject" className="block text-sm font-semibold text-ink mb-1.5">
                Subject
              </label>
              <input
                id="broadcast-subject"
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-base sm:text-sm bg-paper border border-line text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="broadcast-message" className="block text-sm font-semibold text-ink mb-1.5">
                Message
              </label>
              <textarea
                id="broadcast-message"
                required
                rows={7}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-base sm:text-sm bg-paper border border-line text-ink focus:outline-none focus:border-accent resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={sendingEmail || !emailSubject || !emailMessage || optedInCount === 0}
              className="w-full min-h-11 px-4 rounded-full bg-accent-dark hover:bg-accent-dark/90 text-paper text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              Review and send
            </button>
          </form>
        </section>
      </div>

      {/* Confirmation step before anything is sent */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-send-title" className="bg-surface border border-line rounded-card p-6 max-w-md w-full">
            <h2 id="confirm-send-title" className="text-xl font-display font-semibold text-ink">
              Send to {peopleLabel}?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Subject: <span className="font-medium text-ink">&ldquo;{emailSubject}&rdquo;</span>
            </p>
            <p className="mt-1 text-sm text-muted">Once sent, it can&rsquo;t be taken back.</p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={sendingEmail}
                className="min-h-10 px-4 rounded-full border border-line text-sm font-semibold text-ink hover:border-ink transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="min-h-10 px-4 rounded-full bg-accent-dark hover:bg-accent-dark/90 text-paper text-sm font-semibold transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
