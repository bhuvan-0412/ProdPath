'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Resource } from '@/types/curriculum';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Catalog } from './catalog';

// Loaded on demand, so pages don't download them up front:
// - the Supabase client: right after the page becomes interactive
// - the curriculum catalog: once someone is signed in (every page that uses it is behind sign-in)
// - confetti: once someone is signed in, while the browser is idle, so the first tick still celebrates instantly
// - the opt-in and feedback modals: the first time they open
// Each loader starts its download once and shares it with every later caller (a failed download can be retried)
const once = <T,>(load: () => Promise<T>) => {
  let started: Promise<T> | null = null;
  return () =>
    (started ??= load().catch((err) => {
      started = null;
      throw err;
    }));
};
const loadSupabase = once(() => import('@/lib/supabase/client'));
const loadCatalog = once(() => import('./catalog'));
const loadConfetti = once(() => import('canvas-confetti'));
const celebrate = () => {
  loadConfetti()
    .then(({ default: confetti }) =>
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C2603A', '#F3D9CC', '#E8B04A'],
      })
    )
    .catch(() => {});
};

const OptInModal = dynamic(() => import('@/components/OptInModal').then((m) => m.OptInModal), { ssr: false });
const FeedbackModal = dynamic(() => import('@/components/FeedbackModal').then((m) => m.FeedbackModal), { ssr: false });

const whenIdle = (fn: () => void) => {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1500);
};

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  marketing_opt_in: boolean;
  has_seen_opt_in: boolean;
  created_at: string;
}

type Stats = { total: number; completed: number; percentage: number };

interface ProgressContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  completedIds: Set<string>;
  completedDates: Record<string, string>;
  customResources: Resource[];
  notes: Record<string, string>;
  getNote: (resourceId: string) => string;
  saveNote: (resourceId: string, content: string) => Promise<boolean>;
  toggleCompleted: (id: string) => Promise<void>;
  isCompleted: (id: string) => boolean;
  getCompletionDate: (id: string) => string | null;
  addCustomResource: (res: { title: string; url: string; type: Resource['type']; weekId: string; notes?: string }) => Promise<void>;
  deleteCustomResource: (id: string) => Promise<void>;
  getAllResources: () => Resource[];
  getWeekStats: (weekId: string) => Stats;
  getLiveSessionStats: () => Stats;
  getCaseStudyStats: () => Stats;
  getOverallStats: () => Stats;
  getNextIncompleteResource: () => Resource | null;
  resetProgress: () => void;
  signOut: () => Promise<void>;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  isFeedbackModalOpen: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const formatDateString = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const EMPTY_STATS: Stats = { total: 0, completed: 0, percentage: 0 };

const statsFor = (ids: { id: string }[] | string[], completedIds: Set<string>): Stats => {
  const total = ids.length;
  if (total === 0) return EMPTY_STATS;
  let completed = 0;
  for (const item of ids) {
    if (completedIds.has(typeof item === 'string' ? item : item.id)) completed++;
  }
  return { total, completed, percentage: Math.round((completed / total) * 100) };
};

const SAVE_ERROR = "Couldn't save that change. Check your connection and try again.";

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [completedDates, setCompletedDates] = useState<Record<string, string>>({});
  const [customResources, setCustomResources] = useState<Resource[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Modals state. The feedback modal stays mounted after its first open, so a half-written message survives closing it.
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMounted, setFeedbackMounted] = useState(false);

  // Short message when a checkbox change could not be saved
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveErrorTimer = useRef(0);

  // Fetch Supabase data for logged-in user. Returns false if any part failed, so a later auth event can retry.
  const fetchUserData = useCallback(async (client: SupabaseClient, currUser: User): Promise<boolean> => {
    try {
      // 1. Fetch Profile
      const { data: profData, error: profError } = await client
        .from('profiles')
        .select('*')
        .eq('id', currUser.id)
        .maybeSingle();

      if (profData) {
        setProfile(profData);
        if (!profData.has_seen_opt_in) {
          setShowOptInModal(true);
        }
      }

      // 2. Fetch User Progress
      const { data: progressRows, error: progressError } = await client
        .from('user_progress')
        .select('resource_id, completed_at')
        .eq('user_id', currUser.id);

      if (progressRows) {
        const ids = new Set<string>();
        const dates: Record<string, string> = {};
        progressRows.forEach((r) => {
          ids.add(r.resource_id);
          if (r.completed_at) {
            dates[r.resource_id] = formatDateString(new Date(r.completed_at));
          }
        });
        setCompletedIds(ids);
        setCompletedDates(dates);
      }

      // 3. Fetch Custom Resources
      const { data: customRows, error: customError } = await client
        .from('custom_resources')
        .select('*')
        .eq('user_id', currUser.id);

      if (customRows) {
        const formattedCustom: Resource[] = customRows.map((c) => ({
          id: c.id,
          title: c.title,
          url: c.url || '#',
          type: c.type as Resource['type'],
          weekId: c.week_id || 'week-1',
          notes: c.notes || '',
          isCustom: true,
          day: 1,
          taskLabel: 'Custom Addition',
        }));
        setCustomResources(formattedCustom);
      }

      // 4. Fetch Resource Notes
      const { data: noteRows, error: notesError } = await client
        .from('resource_notes')
        .select('resource_id, content')
        .eq('user_id', currUser.id);

      if (noteRows) {
        const fetchedNotes: Record<string, string> = {};
        noteRows.forEach((n) => {
          fetchedNotes[n.resource_id] = n.content;
        });
        setNotes(fetchedNotes);
      }
      return !profError && !progressError && !customError && !notesError;
    } catch (err) {
      console.error('Error fetching user data from Supabase:', err);
      return false;
    }
  }, []);

  // Progress is fetched once per signed-in user per visit, not on every auth event (the initial session,
  // token refreshes and tab refocus all fire one). Callers for the same user share the request in flight.
  const loadedFor = useRef<{ userId: string; done: Promise<void> } | null>(null);
  const loadUserData = useCallback(
    (client: SupabaseClient, currUser: User) => {
      if (loadedFor.current?.userId === currUser.id) return loadedFor.current.done;
      const entry = {
        userId: currUser.id,
        done: Promise.all([
          fetchUserData(client, currUser),
          loadCatalog()
            .then((m) => {
              setCatalog(m.catalog);
              return true;
            })
            .catch((err) => {
              console.error('Error loading the curriculum:', err);
              return false;
            }),
        ]).then(([dataOk, catalogOk]) => {
          // Failed: let the next auth event try again
          if ((!dataOk || !catalogOk) && loadedFor.current === entry) loadedFor.current = null;
          // Ready the confetti for the first tick
          whenIdle(() => {
            loadConfetti().catch(() => {});
          });
        }),
      };
      loadedFor.current = entry;
      return entry.done;
    },
    [fetchUserData]
  );

  const clearUserState = useCallback(() => {
    loadedFor.current = null;
    setUser(null);
    setProfile(null);
    setCompletedIds(new Set());
    setCompletedDates({});
    setCustomResources([]);
    setNotes({});
  }, []);

  // Load the Supabase client, then listen to auth state changes
  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    const start = async () => {
      let client: SupabaseClient;
      try {
        const { createClient, isSupabaseConfigured } = await loadSupabase();
        if (!mounted) return;
        if (!isSupabaseConfigured()) {
          setUser(null);
          setProfile(null);
          setIsLoadingAuth(false);
          return;
        }
        client = createClient();
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setIsLoadingAuth(false);
        return;
      }
      setSupabase(client);

      const initAuth = async () => {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (mounted) {
            if (session?.user) {
              setUser(session.user);
              await loadUserData(client, session.user);
            } else {
              clearUserState();
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        } finally {
          if (mounted) {
            setIsLoadingAuth(false);
          }
        }
      };

      initAuth();

      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await loadUserData(client, session.user);
        } else {
          clearUserState();
        }
        if (mounted) setIsLoadingAuth(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    };

    start();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadUserData, clearUserState]);

  /* ---------- Derived data, recomputed only when progress or the resource list changes ---------- */

  const allResources = useMemo(
    () => (catalog ? [...catalog.builtIn, ...customResources] : [...customResources]),
    [catalog, customResources]
  );

  const weekStats = useMemo(() => {
    const byWeek = new Map<string, { total: number; completed: number }>();
    for (const r of allResources) {
      if (!r.weekId) continue;
      const entry = byWeek.get(r.weekId) || { total: 0, completed: 0 };
      entry.total++;
      if (completedIds.has(r.id)) entry.completed++;
      byWeek.set(r.weekId, entry);
    }
    const out = new Map<string, Stats>();
    byWeek.forEach(({ total, completed }, weekId) => {
      out.set(weekId, { total, completed, percentage: Math.round((completed / total) * 100) });
    });
    return out;
  }, [allResources, completedIds]);

  const overallStats = useMemo(() => statsFor(allResources, completedIds), [allResources, completedIds]);
  const liveSessionStats = useMemo(() => statsFor(catalog?.liveSessionIds || [], completedIds), [catalog, completedIds]);
  const caseStudyStats = useMemo(() => statsFor(catalog?.caseStudyIds || [], completedIds), [catalog, completedIds]);
  const nextIncomplete = useMemo(() => allResources.find((r) => !completedIds.has(r.id)) || null, [allResources, completedIds]);

  const getAllResources = useCallback(() => allResources, [allResources]);
  const getWeekStats = useCallback((weekId: string) => weekStats.get(weekId) || EMPTY_STATS, [weekStats]);
  const getOverallStats = useCallback(() => overallStats, [overallStats]);
  const getLiveSessionStats = useCallback(() => liveSessionStats, [liveSessionStats]);
  const getCaseStudyStats = useCallback(() => caseStudyStats, [caseStudyStats]);
  const getNextIncompleteResource = useCallback(() => nextIncomplete, [nextIncomplete]);

  const showSaveError = useCallback(() => {
    window.clearTimeout(saveErrorTimer.current);
    setSaveError(SAVE_ERROR);
    saveErrorTimer.current = window.setTimeout(() => setSaveError(null), 5000);
  }, []);
  useEffect(() => () => window.clearTimeout(saveErrorTimer.current), []);

  /* ---------- Actions ---------- */

  // Counts changes per item, so a slow failed save never undoes a newer tick of the same item
  const toggleVersions = useRef(new Map<string, number>());

  // Optimistic: the tick (and confetti) show at once and the save runs in the background.
  // If the save fails, the tick is undone and a short message shows. The database write is unchanged.
  const toggleCompleted = useCallback(
    async (id: string) => {
      const todayStr = formatDateString();
      const isNowCompleted = !completedIds.has(id);
      const previousDate = completedDates[id];
      const version = (toggleVersions.current.get(id) || 0) + 1;
      toggleVersions.current.set(id, version);

      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (isNowCompleted) next.add(id);
        else next.delete(id);
        return next;
      });
      setCompletedDates((prev) => {
        const next = { ...prev };
        if (isNowCompleted) next[id] = todayStr;
        else delete next[id];
        return next;
      });
      if (isNowCompleted) celebrate();

      // Supabase Sync if logged in
      if (!user || !supabase) return;
      let failed = false;
      try {
        const { error } = isNowCompleted
          ? await supabase.from('user_progress').upsert({
              user_id: user.id,
              resource_id: id,
              completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,resource_id' })
          : await supabase
              .from('user_progress')
              .delete()
              .eq('user_id', user.id)
              .eq('resource_id', id);
        if (error) {
          console.error('Failed to sync progress with Supabase:', error);
          failed = true;
        }
      } catch (err) {
        console.error('Failed to sync progress with Supabase:', err);
        failed = true;
      }

      if (!failed || toggleVersions.current.get(id) !== version) return;
      // Undo the tick
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (isNowCompleted) next.delete(id);
        else next.add(id);
        return next;
      });
      setCompletedDates((prev) => {
        const next = { ...prev };
        if (isNowCompleted || !previousDate) delete next[id];
        else next[id] = previousDate;
        return next;
      });
      showSaveError();
    },
    [completedIds, completedDates, user, supabase, showSaveError]
  );

  const isCompleted = useCallback((id: string) => completedIds.has(id), [completedIds]);

  const getCompletionDate = useCallback((id: string): string | null => completedDates[id] || null, [completedDates]);

  const addCustomResource = useCallback(
    async ({
      title,
      url,
      type,
      weekId,
      notes,
    }: {
      title: string;
      url: string;
      type: Resource['type'];
      weekId: string;
      notes?: string;
    }) => {
      const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newRes: Resource = {
        id: newId,
        title,
        url,
        type,
        weekId,
        notes,
        isCustom: true,
        day: 1,
        taskLabel: 'Custom Addition',
      };

      // Optimistic UI update
      setCustomResources((prev) => [newRes, ...prev]);

      // Supabase Sync if logged in
      if (user && supabase) {
        try {
          const { data, error } = await supabase.from('custom_resources').insert({
            user_id: user.id,
            title,
            url,
            type,
            week_id: weekId,
            notes,
          }).select('id').single();

          if (data && !error) {
            // Replace temporary ID with generated UUID
            setCustomResources((prev) =>
              prev.map((r) => (r.id === newId ? { ...r, id: data.id } : r))
            );
          }
        } catch (err) {
          console.error('Failed to save custom resource to Supabase:', err);
        }
      }
    },
    [user, supabase]
  );

  const deleteCustomResource = useCallback(
    async (id: string) => {
      setCustomResources((prev) => prev.filter((r) => r.id !== id));
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setCompletedDates((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      if (user && supabase) {
        try {
          await supabase.from('custom_resources').delete().eq('id', id).eq('user_id', user.id);
          await supabase.from('user_progress').delete().eq('resource_id', id).eq('user_id', user.id);
          await supabase.from('resource_notes').delete().eq('resource_id', id).eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to delete custom resource from Supabase:', err);
        }
      }
    },
    [user, supabase]
  );

  const getNote = useCallback((resourceId: string) => notes[resourceId] || '', [notes]);

  // Saves a note; an empty note deletes it. Returns false if the cloud save failed.
  const saveNote = useCallback(
    async (resourceId: string, content: string): Promise<boolean> => {
      const trimmed = content.trim();
      const previous = notes[resourceId];

      setNotes((prev) => {
        const next = { ...prev };
        if (trimmed) {
          next[resourceId] = trimmed;
        } else {
          delete next[resourceId];
        }
        return next;
      });

      if (!user || !supabase) return true;

      const { error } = trimmed
        ? await supabase.from('resource_notes').upsert({
            user_id: user.id,
            resource_id: resourceId,
            content: trimmed,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,resource_id' })
        : await supabase
            .from('resource_notes')
            .delete()
            .eq('user_id', user.id)
            .eq('resource_id', resourceId);

      if (error) {
        console.error('Failed to save note to Supabase:', error);
        // Roll back the optimistic update
        setNotes((prev) => {
          const next = { ...prev };
          if (previous) {
            next[resourceId] = previous;
          } else {
            delete next[resourceId];
          }
          return next;
        });
        return false;
      }
      return true;
    },
    [notes, user, supabase]
  );

  const resetProgress = useCallback(async () => {
    if (confirm('Are you sure you want to reset all completion progress? Custom resources will be preserved.')) {
      setCompletedIds(new Set());
      setCompletedDates({});

      if (user && supabase) {
        try {
          await supabase.from('user_progress').delete().eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to reset user progress in Supabase:', err);
        }
      }
    }
  }, [user, supabase]);

  const handleSignOut = useCallback(async () => {
    try {
      const client = supabase || (await loadSupabase()).createClient();
      await client.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    clearUserState();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [supabase, clearUserState]);

  const openFeedbackModal = useCallback(() => {
    setFeedbackMounted(true);
    setShowFeedbackModal(true);
  }, []);
  const closeFeedbackModal = useCallback(() => setShowFeedbackModal(false), []);

  const value = useMemo<ProgressContextType>(
    () => ({
      user,
      profile,
      isAdmin: profile?.is_admin || false,
      isLoadingAuth,
      completedIds,
      completedDates,
      customResources,
      notes,
      getNote,
      saveNote,
      toggleCompleted,
      isCompleted,
      getCompletionDate,
      addCustomResource,
      deleteCustomResource,
      getAllResources,
      getWeekStats,
      getLiveSessionStats,
      getCaseStudyStats,
      getOverallStats,
      getNextIncompleteResource,
      resetProgress,
      signOut: handleSignOut,
      openFeedbackModal,
      closeFeedbackModal,
      isFeedbackModalOpen: showFeedbackModal,
    }),
    [
      user,
      profile,
      isLoadingAuth,
      completedIds,
      completedDates,
      customResources,
      notes,
      getNote,
      saveNote,
      toggleCompleted,
      isCompleted,
      getCompletionDate,
      addCustomResource,
      deleteCustomResource,
      getAllResources,
      getWeekStats,
      getLiveSessionStats,
      getCaseStudyStats,
      getOverallStats,
      getNextIncompleteResource,
      resetProgress,
      handleSignOut,
      openFeedbackModal,
      closeFeedbackModal,
      showFeedbackModal,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}

      {/* Opt-in Prompt Modal */}
      {showOptInModal && user && (
        <OptInModal
          userId={user.id}
          onClose={() => setShowOptInModal(false)}
        />
      )}

      {/* Feedback Modal */}
      {feedbackMounted && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={closeFeedbackModal}
        />
      )}

      {/* A checkbox change that could not be saved */}
      {saveError && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
          <p
            role="alert"
            className="pointer-events-auto max-w-md rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm font-medium text-danger shadow-offset animate-fade-in"
          >
            {saveError}
          </p>
        </div>
      )}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
};
