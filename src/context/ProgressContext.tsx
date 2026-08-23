'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Resource, Week, LiveSession, CaseStudy } from '@/types/curriculum';
import weeksData from '@/data/weeks.json';
import liveSessionsData from '@/data/liveSessions.json';
import caseStudiesData from '@/data/caseStudies.json';
import confetti from 'canvas-confetti';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { OptInModal } from '@/components/OptInModal';
import { ImportProgressModal } from '@/components/ImportProgressModal';
import { FeedbackModal } from '@/components/FeedbackModal';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  marketing_opt_in: boolean;
  has_seen_opt_in: boolean;
  created_at: string;
}

interface ProgressContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  completedIds: Set<string>;
  completedDates: Record<string, string>;
  customResources: Resource[];
  toggleCompleted: (id: string) => Promise<void>;
  isCompleted: (id: string) => boolean;
  getCompletionDate: (id: string) => string | null;
  addCustomResource: (res: { title: string; url: string; type: Resource['type']; weekId: string; notes?: string }) => Promise<void>;
  deleteCustomResource: (id: string) => Promise<void>;
  getAllResources: () => Resource[];
  getWeekStats: (weekId: string) => { total: number; completed: number; percentage: number };
  getLiveSessionStats: () => { total: number; completed: number; percentage: number };
  getCaseStudyStats: () => { total: number; completed: number; percentage: number };
  getOverallStats: () => { total: number; completed: number; percentage: number };
  getNextIncompleteResource: () => Resource | null;
  resetProgress: () => void;
  signOut: () => Promise<void>;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  isFeedbackModalOpen: boolean;
}

const STORAGE_KEY_COMPLETED = 'prodpath_completed_ids_v1';
const STORAGE_KEY_DATES = 'prodpath_completed_dates_v1';
const STORAGE_KEY_CUSTOM = 'prodpath_custom_resources_v1';
const LEGACY_STORAGE_KEY_COMPLETED = 'pm_hub_completed_ids_v1';
const LEGACY_STORAGE_KEY_CUSTOM = 'pm_hub_custom_resources_v1';

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const formatDateString = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to flatten standard weeks.json into a list of resources with metadata
const flattenCurriculum = (): Resource[] => {
  const list: Resource[] = [];
  (weeksData.weeks as Week[]).forEach((week) => {
    week.days.forEach((dayObj) => {
      dayObj.tasks.forEach((taskObj) => {
        taskObj.resources.forEach((res) => {
          list.push({
            ...res,
            weekId: week.id,
            day: dayObj.day,
            taskLabel: taskObj.label,
            isCustom: false,
          });
        });
      });
    });
  });
  return list;
};

// Helper to flatten liveSessions.json into resources
const flattenLiveSessions = (): Resource[] => {
  return (liveSessionsData.liveSessions as LiveSession[]).map((session) => ({
    id: `live-session-${session.sessionNumber}`,
    title: `Session ${session.sessionNumber}: ${session.topic}`,
    url: session.videoUrl,
    type: 'video' as const,
    notes: `Speaker: ${session.speaker}`,
    isCustom: false,
    taskLabel: `Live Session ${session.sessionNumber}`,
  }));
};

// Helper to flatten caseStudies.json into resources
const flattenCaseStudies = (): Resource[] => {
  return (caseStudiesData.caseStudies as CaseStudy[]).map((cs) => ({
    id: cs.id,
    title: cs.title,
    url: '#',
    type: 'case-study' as const,
    summary: cs.summary,
    takeaways: cs.takeaways,
    furtherReading: cs.furtherReading,
    isCustom: false,
    taskLabel: 'Case Study',
  }));
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [completedDates, setCompletedDates] = useState<Record<string, string>>({});
  const [customResources, setCustomResources] = useState<Resource[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals state
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingLocalCompleted, setPendingLocalCompleted] = useState<string[]>([]);
  const [pendingLocalCustom, setPendingLocalCustom] = useState<Resource[]>([]);

  const supabase = useMemo(() => createClient(), []);

  // Fetch Supabase data for logged-in user
  const fetchUserData = useCallback(async (currUser: User) => {
    try {
      // 1. Fetch Profile
      const { data: profData } = await supabase
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
      const { data: progressRows } = await supabase
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
      const { data: customRows } = await supabase
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

      // 4. Check for unmigrated guest progress in localStorage
      if (typeof window !== 'undefined') {
        const savedCompletedStr = localStorage.getItem(STORAGE_KEY_COMPLETED) || localStorage.getItem(LEGACY_STORAGE_KEY_COMPLETED);
        const savedCustomStr = localStorage.getItem(STORAGE_KEY_CUSTOM) || localStorage.getItem(LEGACY_STORAGE_KEY_CUSTOM);
        
        let localIds: string[] = [];
        let localCustom: Resource[] = [];

        if (savedCompletedStr) {
          try { localIds = JSON.parse(savedCompletedStr); } catch {}
        }
        if (savedCustomStr) {
          try { localCustom = JSON.parse(savedCustomStr); } catch {}
        }

        // Only prompt if guest progress has items not yet in user progress
        const newCompleted = localIds.filter((id) => !progressRows?.some((r) => r.resource_id === id));
        if (newCompleted.length > 0 || localCustom.length > 0) {
          setPendingLocalCompleted(newCompleted);
          setPendingLocalCustom(localCustom);
          setShowImportModal(true);
        }
      }
    } catch (err) {
      console.error('Error fetching user data from Supabase:', err);
    }
  }, [supabase]);

  // Handle local storage load for guest
  const loadLocalStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED) || localStorage.getItem(LEGACY_STORAGE_KEY_COMPLETED);
        if (savedCompleted) {
          setCompletedIds(new Set(JSON.parse(savedCompleted)));
        }

        const savedDates = localStorage.getItem(STORAGE_KEY_DATES);
        if (savedDates) {
          setCompletedDates(JSON.parse(savedDates));
        }

        const savedCustom = localStorage.getItem(STORAGE_KEY_CUSTOM) || localStorage.getItem(LEGACY_STORAGE_KEY_CUSTOM);
        if (savedCustom) {
          setCustomResources(JSON.parse(savedCustom));
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data:', e);
    }
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured()) {
      setUser(null);
      setProfile(null);
      loadLocalStorage();
      setIsLoadingAuth(false);
      setIsLoaded(true);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchUserData(session.user);
          } else {
            setUser(null);
            setProfile(null);
            loadLocalStorage();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) loadLocalStorage();
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
          setIsLoaded(true);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setProfile(null);
        loadLocalStorage();
      }
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData, loadLocalStorage]);

  // Guest localStorage syncs
  useEffect(() => {
    if (!isLoaded || user || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(completedIds)));
    } catch (e) {
      console.error('Failed to save completed IDs:', e);
    }
  }, [completedIds, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || user || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_DATES, JSON.stringify(completedDates));
    } catch (e) {
      console.error('Failed to save completed dates:', e);
    }
  }, [completedDates, isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || user || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customResources));
    } catch (e) {
      console.error('Failed to save custom resources:', e);
    }
  }, [customResources, isLoaded, user]);

  const curriculumResources = useMemo(() => flattenCurriculum(), []);
  const liveSessionResources = useMemo(() => flattenLiveSessions(), []);
  const caseStudyResources = useMemo(() => flattenCaseStudies(), []);

  const getAllResources = useMemo(() => {
    return () => [...curriculumResources, ...liveSessionResources, ...caseStudyResources, ...customResources];
  }, [curriculumResources, liveSessionResources, caseStudyResources, customResources]);

  const toggleCompleted = async (id: string) => {
    const todayStr = formatDateString();
    const isNowCompleted = !completedIds.has(id);

    // Optimistic UI update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (isNowCompleted) {
        next.add(id);
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#22c55e', '#a78bfa'],
        });
      } else {
        next.delete(id);
      }
      return next;
    });

    setCompletedDates((prev) => {
      const next = { ...prev };
      if (isNowCompleted) {
        next[id] = todayStr;
      } else {
        delete next[id];
      }
      return next;
    });

    // Supabase Sync if logged in
    if (user) {
      try {
        if (isNowCompleted) {
          await supabase.from('user_progress').upsert({
            user_id: user.id,
            resource_id: id,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'user_id,resource_id' });
        } else {
          await supabase
            .from('user_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('resource_id', id);
        }
      } catch (err) {
        console.error('Failed to sync progress with Supabase:', err);
      }
    }
  };

  const isCompleted = (id: string) => completedIds.has(id);

  const getCompletionDate = (id: string): string | null => {
    return completedDates[id] || null;
  };

  const addCustomResource = async ({
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
    if (user) {
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
  };

  const deleteCustomResource = async (id: string) => {
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

    if (user) {
      try {
        await supabase.from('custom_resources').delete().eq('id', id).eq('user_id', user.id);
        await supabase.from('user_progress').delete().eq('resource_id', id).eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to delete custom resource from Supabase:', err);
      }
    }
  };

  const getWeekStats = (weekId: string) => {
    const weekResources = getAllResources().filter((r) => r.weekId === weekId);
    const total = weekResources.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = weekResources.filter((r) => completedIds.has(r.id)).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const getLiveSessionStats = () => {
    const total = liveSessionsData.liveSessions.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = liveSessionsData.liveSessions.filter((s) =>
      completedIds.has(`live-session-${s.sessionNumber}`)
    ).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const getCaseStudyStats = () => {
    const total = caseStudiesData.caseStudies.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = caseStudiesData.caseStudies.filter((cs) =>
      completedIds.has(cs.id)
    ).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const getOverallStats = () => {
    const all = getAllResources();
    const total = all.length;
    if (total === 0) return { total: 0, completed: 0, percentage: 0 };
    const completed = all.filter((r) => completedIds.has(r.id)).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const getNextIncompleteResource = (): Resource | null => {
    const all = getAllResources();
    return all.find((r) => !completedIds.has(r.id)) || null;
  };

  const resetProgress = async () => {
    if (confirm('Are you sure you want to reset all completion progress? Custom resources will be preserved.')) {
      setCompletedIds(new Set());
      setCompletedDates({});

      if (user) {
        try {
          await supabase.from('user_progress').delete().eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to reset user progress in Supabase:', err);
        }
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DATES);
      }
    }
  };

  // Bulk import local progress into user account
  const handleImportProgress = async () => {
    if (!user) return;
    try {
      if (pendingLocalCompleted.length > 0) {
        const progressInserts = pendingLocalCompleted.map((resId) => ({
          user_id: user.id,
          resource_id: resId,
          completed_at: new Date().toISOString(),
        }));
        await supabase.from('user_progress').upsert(progressInserts, { onConflict: 'user_id,resource_id' });
      }

      if (pendingLocalCustom.length > 0) {
        const customInserts = pendingLocalCustom.map((c) => ({
          user_id: user.id,
          title: c.title,
          url: c.url,
          type: c.type,
          week_id: c.weekId,
          notes: c.notes,
        }));
        await supabase.from('custom_resources').insert(customInserts);
      }

      // Clear local storage after successful import
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DATES);
        localStorage.removeItem(STORAGE_KEY_CUSTOM);
      }

      // Refresh user data from Supabase
      await fetchUserData(user);
    } catch (err) {
      console.error('Error importing guest progress:', err);
    } finally {
      setShowImportModal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCompletedIds(new Set());
    setCompletedDates({});
    setCustomResources([]);
    loadLocalStorage();
  };

  return (
    <ProgressContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.is_admin || false,
        isLoadingAuth,
        completedIds,
        completedDates,
        customResources,
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
        openFeedbackModal: () => setShowFeedbackModal(true),
        closeFeedbackModal: () => setShowFeedbackModal(false),
        isFeedbackModalOpen: showFeedbackModal,
      }}
    >
      {children}

      {/* Opt-in Prompt Modal */}
      {showOptInModal && user && (
        <OptInModal
          userId={user.id}
          onClose={() => setShowOptInModal(false)}
        />
      )}

      {/* Import Progress Modal */}
      {showImportModal && user && (
        <ImportProgressModal
          completedCount={pendingLocalCompleted.length}
          customCount={pendingLocalCustom.length}
          onImport={handleImportProgress}
          onSkip={() => setShowImportModal(false)}
        />
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
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
