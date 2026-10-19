// The built-in curriculum, live sessions and case studies as one flat list of resources.
// ProgressContext loads this module on demand (only once someone is signed in), so the curriculum data is
// not part of the JavaScript every page downloads.

import type { Resource, Week, LiveSession, CaseStudy } from '@/types/curriculum';
import weeksData from '@/data/weeks.json';
import liveSessionsData from '@/data/liveSessions.json';
import caseStudiesData from '@/data/caseStudies.json';

const curriculum: Resource[] = (weeksData.weeks as Week[]).flatMap((week) =>
  week.days.flatMap((dayObj) =>
    dayObj.tasks.flatMap((taskObj) =>
      taskObj.resources.map((res) => ({
        ...res,
        weekId: week.id,
        day: dayObj.day,
        taskLabel: taskObj.label,
        isCustom: false,
      }))
    )
  )
);

const liveSessions: Resource[] = (liveSessionsData.liveSessions as LiveSession[]).map((session) => ({
  id: `live-session-${session.sessionNumber}`,
  title: `Session ${session.sessionNumber}: ${session.topic}`,
  url: session.videoUrl,
  type: 'video' as const,
  notes: `Speaker: ${session.speaker}`,
  isCustom: false,
  taskLabel: `Live Session ${session.sessionNumber}`,
}));

const caseStudies: Resource[] = (caseStudiesData.caseStudies as CaseStudy[]).map((cs) => ({
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

export interface Catalog {
  /** Curriculum, then live sessions, then case studies (the order "next up" walks through) */
  builtIn: Resource[];
  liveSessionIds: string[];
  caseStudyIds: string[];
}

export const catalog: Catalog = {
  builtIn: [...curriculum, ...liveSessions, ...caseStudies],
  liveSessionIds: liveSessions.map((r) => r.id),
  caseStudyIds: caseStudies.map((r) => r.id),
};
