export type ResourceType = 'article' | 'video' | 'playlist';

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  notes?: string;
  isCustom?: boolean;
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
  date: string;
  week: string;
  topic: string;
  dayOfWeek: string;
  sessionType: 'Resources' | 'Assessment' | 'Capstone';
}

