'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Users, MailCheck, ShieldCheck, Send, CheckCircle2, AlertTriangle, RefreshCw, X, Award } from 'lucide-react';
import weeksData from '@/data/weeks.json';
import liveSessionsData from '@/data/liveSessions.json';
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

  // Calculate total total total resources count in standard curriculum
  const totalCurriculumResources = useMemo(() => {
    let count = 0;
    weeksData.weeks.forEach((w) => {
      w.days.forEach((d) => {
        d.tasks.forEach((t) => {
          count += t.resources.length;
        });
      });
    });
    count += liveSessionsData.liveSessions.length;
    count += caseStudiesData.caseStudies.length;
    return count || 1;
  }, []);

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
        progressMap.get(entry.user_id)?.add(entry.resource_id);
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
  }, [supabase, totalCurriculumResources]);

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

  if (isLoadingAuth || (!isAdmin && user)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            User Analytics & Communication
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loadingStats}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {emailSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
          <button onClick={() => setEmailSuccessMsg(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Total Registered Users
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loadingStats ? '...' : usersList.length}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Google OAuth authenticated</p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Marketing Opt-ins
            </span>
            <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <MailCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loadingStats ? '...' : optedInCount}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            {usersList.length > 0 ? Math.round((optedInCount / usersList.length) * 100) : 0}% opt-in rate
          </p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Avg. Completion Rate
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            {loadingStats
              ? '...'
              : usersList.length > 0
              ? Math.round(usersList.reduce((acc, u) => acc + u.completion_percentage, 0) / usersList.length) + '%'
              : '0%'}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Across all registered accounts</p>
        </div>
      </div>

      {/* Main Grid: User Table & Email Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Table */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            <span>Registered Users Directory</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase font-semibold text-[10px]">
                  <th className="pb-3 px-2">User</th>
                  <th className="pb-3 px-2">Joined</th>
                  <th className="pb-3 px-2">Progress</th>
                  <th className="pb-3 px-2 text-right">Marketing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-400">
                      {loadingStats ? 'Loading users...' : 'No registered users found.'}
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {u.full_name || 'Anonymous User'}
                          {u.is_admin && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-2 text-zinc-500 whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            <div
                              className="h-full bg-violet-600 rounded-full transition-all"
                              style={{ width: `${u.completion_percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {u.completion_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        {u.marketing_opt_in ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            Opted In
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-medium">
                            Opted Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Broadcast Form */}
        <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-indigo-500" />
            <span>Send Email Campaign</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
            Broadcast a manual update via Resend to all users who opted into marketing communications.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (optedInCount === 0) {
                setErrorMsg('No opted-in recipients available to email.');
                return;
              }
              setShowConfirmModal(true);
            }}
            className="space-y-4 flex-1 flex flex-col"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. New Product Management Case Studies Available!"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Message Body
              </label>
              <textarea
                required
                rows={6}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Write your broadcast update message here..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none flex-1"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sendingEmail || !emailSubject || !emailMessage || optedInCount === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Prepare Campaign ({optedInCount} Opted-In)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal before Sending Email */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Confirm Email Campaign
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Manual broadcast trigger
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/50 mb-6 text-xs text-violet-900 dark:text-violet-200 space-y-2">
              <p className="font-semibold text-sm">
                This will email {optedInCount} opted-in user{optedInCount === 1 ? '' : 's'}.
              </p>
              <p className="text-violet-700 dark:text-violet-300">
                Subject: <span className="font-medium text-zinc-900 dark:text-white">&quot;{emailSubject}&quot;</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={sendingEmail}
                className="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-violet-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Send Now</span>
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
