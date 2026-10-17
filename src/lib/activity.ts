// Read-only activity maths for the Activity page: streaks and the 12-week heat map.
// Input is the completion data ProgressContext already holds: resource id -> completion date, stored as
// a local-date string such as "14 Oct 2026" (made with toLocaleDateString, so it is already the user's
// local day, not UTC). Nothing here writes or reloads data.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Local midnight for a date */
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Adds whole calendar days (safe across daylight-saving changes) */
export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** "2026-10-14": a stable key for one local calendar day */
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "14 Oct" */
export const shortDate = (d: Date) => `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;

/** Parses a stored completion date ("14 Oct 2026", also "14 Sept 2026") into a local date, or null */
export const parseCompletionDate = (value: string): Date | null => {
  const match = /^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const month = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  const date = new Date(Number(match[3]), month, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Number of completed items per local day. Pass `countIds` to count only those ids. */
export const countByDay = (completedDates: Record<string, string>, countIds?: Set<string>) => {
  const counts = new Map<string, number>();
  for (const [id, value] of Object.entries(completedDates)) {
    if (countIds && !countIds.has(id)) continue;
    const date = value ? parseCompletionDate(value) : null;
    if (!date) continue;
    const key = dayKey(date);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
};

/** Monday of the week containing `d` (weeks run Monday to Sunday) */
export const startOfWeek = (d: Date) => addDays(startOfDay(d), -((d.getDay() + 6) % 7));

export interface ActivityStats {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  doneThisWeek: number;
}

export const getActivityStats = (counts: Map<string, number>, now: Date = new Date()): ActivityStats => {
  const today = startOfDay(now);
  const isActive = (d: Date) => (counts.get(dayKey(d)) || 0) > 0;

  // Current streak: consecutive active days ending today. If today has nothing yet,
  // the streak still stands from yesterday; it only breaks after a full missed day.
  let currentStreak = 0;
  let cursor = isActive(today) ? today : addDays(today, -1);
  while (isActive(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // Longest streak: walk the active days in order
  const activeDates = [...counts.entries()]
    .filter(([, n]) => n > 0)
    .map(([key]) => {
      const [y, m, d] = key.split('-').map(Number);
      return new Date(y, m - 1, d);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const date of activeDates) {
    run = previous && dayKey(addDays(previous, 1)) === dayKey(date) ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = date;
  }

  // Done this week: Monday to today
  let doneThisWeek = 0;
  for (let d = startOfWeek(today); d <= today; d = addDays(d, 1)) {
    doneThisWeek += counts.get(dayKey(d)) || 0;
  }

  return { currentStreak, longestStreak, activeDays: activeDates.length, doneThisWeek };
};

/** Shade level 0-4: 0 none, 1 = 1-2, 2 = 3-4, 3 = 5-7, 4 = 8+ */
export const heatLevel = (count: number) => (count >= 8 ? 4 : count >= 5 ? 3 : count >= 3 ? 2 : count >= 1 ? 1 : 0);

export interface HeatCell {
  key: string;
  date: Date;
  count: number;
  level: number;
  isToday: boolean;
}

export interface HeatMapData {
  /** weeks[column][row]: row 0 = Monday ... 6 = Sunday; null = a future day (not shown) */
  weeks: (HeatCell | null)[][];
  /** Month name above a column, where a new month starts */
  monthLabels: { column: number; label: string }[];
}

export const buildHeatMap = (counts: Map<string, number>, now: Date = new Date(), weekCount = 12): HeatMapData => {
  const today = startOfDay(now);
  const firstMonday = addDays(startOfWeek(today), -7 * (weekCount - 1));

  const weeks: (HeatCell | null)[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const column: (HeatCell | null)[] = [];
    for (let r = 0; r < 7; r++) {
      const date = addDays(firstMonday, w * 7 + r);
      if (date > today) {
        column.push(null);
        continue;
      }
      const key = dayKey(date);
      const count = counts.get(key) || 0;
      column.push({ key, date, count, level: heatLevel(count), isToday: key === dayKey(today) });
    }
    weeks.push(column);
  }

  // Each column belongs to the month its Sunday falls in; label a column where that month changes.
  // Drop the first label if the next one would crowd it.
  const monthLabels: { column: number; label: string }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weekCount; w++) {
    const month = addDays(firstMonday, w * 7 + 6).getMonth();
    if (month !== lastMonth) monthLabels.push({ column: w, label: MONTH_LABELS[month] });
    lastMonth = month;
  }
  if (monthLabels.length > 1 && monthLabels[1].column - monthLabels[0].column < 2) monthLabels.shift();

  return { weeks, monthLabels };
};
