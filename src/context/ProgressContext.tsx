'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Resource, Week, LiveSession, CaseStudy } from '@/types/curriculum';
import weeksData from '@/data/weeks.json';
import liveSessionsData from '@/data/liveSessions.json';
import caseStudiesData from '@/data/caseStudies.json';
import confetti from 'canvas-confetti';

interface ProgressContextType {
  completedIds: Set<string>;
  completedDates: Record<string, string>;
  customResources: Resource[];
  toggleCompleted: (id: string) => void;
  isCompleted: (id: string) => boolean;
  getCompletionDate: (id: string) => string | null;
  addCustomResource: (res: { title: string; url: string; type: Resource['type']; weekId: string; notes?: string }) => void;
  deleteCustomResource: (id: string) => void;
  getAllResources: () => Resource[];
  getWeekStats: (weekId: string) => { total: number; completed: number; percentage: number };
  getLiveSessionStats: () => { total: number; completed: number; percentage: number };
  getCaseStudyStats: () => { total: number; completed: number; percentage: number };
  getOverallStats: () => { total: number; completed: number; percentage: number };
  getNextIncompleteResource: () => Resource | null;
  resetProgress: () => void;
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
    isCustom: false,
    taskLabel: 'Case Study',
  }));
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [completedDates, setCompletedDates] = useState<Record<string, string>>({});
  const [customResources, setCustomResources] = useState<Resource[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
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
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save completedIds to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(completedIds)));
    } catch (e) {
      console.error('Failed to save completed IDs:', e);
    }
  }, [completedIds, isLoaded]);

  // Save completedDates to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_DATES, JSON.stringify(completedDates));
    } catch (e) {
      console.error('Failed to save completed dates:', e);
    }
  }, [completedDates, isLoaded]);

  // Save customResources to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customResources));
    } catch (e) {
      console.error('Failed to save custom resources:', e);
    }
  }, [customResources, isLoaded]);

  const curriculumResources = useMemo(() => flattenCurriculum(), []);
  const liveSessionResources = useMemo(() => flattenLiveSessions(), []);
  const caseStudyResources = useMemo(() => flattenCaseStudies(), []);

  const getAllResources = useMemo(() => {
    return () => [...curriculumResources, ...liveSessionResources, ...caseStudyResources, ...customResources];
  }, [curriculumResources, liveSessionResources, caseStudyResources, customResources]);

  const toggleCompleted = (id: string) => {
    const todayStr = formatDateString();

    setCompletedIds((prev) => {
      const next = new Set(prev);
      const isNowCompleted = !next.has(id);
      if (isNowCompleted) {
        next.add(id);
        // Trigger celebratory micro-animation!
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#8b5cf6', '#22c55e', '#a78bfa']
        });
      } else {
        next.delete(id);
      }
      return next;
    });

    setCompletedDates((prev) => {
      const next = { ...prev };
      if (!completedIds.has(id)) {
        next[id] = todayStr;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const isCompleted = (id: string) => completedIds.has(id);

  const getCompletionDate = (id: string): string | null => {
    if (completedDates[id]) return completedDates[id];
    return null;
  };

  const addCustomResource = ({
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
    const newRes: Resource = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      url,
      type,
      weekId,
      notes,
      isCustom: true,
      day: 1,
      taskLabel: 'Custom Addition'
    };

    setCustomResources((prev) => [newRes, ...prev]);
  };

  const deleteCustomResource = (id: string) => {
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

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all completion progress? Custom resources will be preserved.')) {
      setCompletedIds(new Set());
      setCompletedDates({});
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DATES);
      }
    }
  };

  return (
    <ProgressContext.Provider
      value={{
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
      }}
    >
      {children}
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
