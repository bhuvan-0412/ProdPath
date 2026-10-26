export type ResourceType = 'article' | 'video' | 'playlist' | 'case-study';

export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  takeaways: string[];
  furtherReading?: { title: string; url: string }[];
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  notes?: string;
  summary?: string;
  takeaways?: string[];
  furtherReading?: { title: string; url: string }[];
  isCustom?: boolean;
  badge?: string;
  weekId?: string;
  day?: number;
  taskLabel?: string;
}

export interface LiveSession {
  sessionNumber: number;
  speaker: string;
  topic: string;
  videoUrl: string;
}

export interface Task {
  label: string;
  resources: Resource[];
}

export interface Day {
  day: number;
  brief: string;
  tasks: Task[];
}

export interface Week {
  id: string;
  title: string;
  days: Day[];
}

export interface ScheduleItem {
  id: string;
  week: string;
  day?: number;
  topic: string;
  sessionType: 'Resources' | 'Assessment';
}

