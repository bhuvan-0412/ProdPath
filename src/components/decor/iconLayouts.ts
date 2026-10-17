import type { BgIcon, IconKind } from './BackgroundIcons';

// Hand-placed background icon layouts, one per page (and per landing section).
// Each spot is [x %, y %, size px, tilt deg, fill?, from?]. Spots are generous on purpose: at run time any
// icon that would come within reach of content, the screen edge or another icon is left out, so a layout
// thins itself out on smaller screens. The icon kinds are listed separately per page so neighbours vary.

type Spot = [number, number, number, number, ('soft' | 'gold' | '')?, ('md' | 'lg')?];

const build = (kinds: IconKind[], spots: Spot[]): BgIcon[] =>
  spots.map(([x, y, s, r, f, from], i) => ({
    k: kinds[i % kinds.length],
    x,
    y,
    s,
    r,
    f: f || undefined,
    from,
  }));

/* ---------- Landing page sections ---------- */

export const HERO_ICONS = build(
  ['lightbulb', 'target', 'note', 'cursor', 'compass', 'chat', 'pieChart', 'pencil', 'rocket', 'puzzle', 'flag', 'search'],
  [
    [3.2, 14, 40, -10, 'soft'],
    [4.2, 44, 26, 8],
    [2.8, 74, 48, -6, '', 'md'],
    [5.5, 95, 24, 12],
    [13, 3.5, 22, 6, '', 'md'],
    [27, 4, 30, -8, 'gold', 'md'],
    [41, 3.5, 24, 10, '', 'lg'],
    [12, 92, 32, -4, 'gold', 'md'],
    [22, 96, 22, 14, '', 'md'],
    [33, 90, 44, -12, 'soft', 'md'],
    [44, 95, 26, 6, '', 'lg'],
    [7.5, 30, 22, -14, '', 'lg'],
    // Tablets: beside the button, before the illustration starts below
    [78, 24, 32, 8, 'soft', 'md'],
    [91, 15, 24, -6, '', 'md'],
    [64, 30, 22, 10, '', 'md'],
  ]
);

export const PATH_ICONS = build(
  ['kanban', 'user', 'calendar', 'checklist', 'flag', 'gear', 'barChart', 'trophy', 'pin', 'lineChart', 'phone'],
  [
    [3, 10, 36, -8, 'soft'],
    [2.6, 46, 24, 10],
    [4, 82, 44, -6, 'gold', 'md'],
    [12, 60, 38, 8, 'soft', 'lg'],
    [18, 78, 26, -10, '', 'lg'],
    [11, 94, 22, 6, '', 'lg'],
    [60, 32, 34, -6, '', 'md'],
    [78, 18, 26, 12, 'gold', 'md'],
    [72, 62, 40, -8, 'soft', 'md'],
    [88, 44, 24, 6, '', 'md'],
    [62, 88, 28, 10, '', 'md'],
    [86, 82, 34, -12, 'gold', 'md'],
    [48, 96, 22, -4, '', 'md'],
    // Phones: beside the short heading and the week names
    [92, 6, 22, 10],
    [91, 38, 24, -8, 'soft'],
    [92, 66, 22, 6],
  ]
);

export const DAY_ICONS = build(
  ['note', 'cursor', 'checklist', 'lightbulb', 'calendar', 'pencil', 'chat', 'target', 'plane', 'search'],
  [
    [3.2, 16, 30, 8],
    [2.8, 56, 46, -8, 'soft', 'md'],
    [4.5, 90, 24, 12],
    [14, 74, 34, -6, 'gold', 'lg'],
    [20, 93, 22, 10, '', 'lg'],
    [80, 10, 28, -10, '', 'lg'],
    [88, 30, 40, 6, 'soft', 'lg'],
    [93, 56, 24, -6, '', 'lg'],
    [82, 88, 36, 12, 'gold', 'lg'],
    [66, 96, 22, -8, '', 'md'],
    // Tablets and phones: beside the heading
    [76, 7, 32, -6, 'gold', 'md'],
    [91, 13, 24, 8],
  ]
);

export const FEATURE_ICONS = build(
  ['barChart', 'trophy', 'pieChart', 'funnel', 'lineChart', 'search', 'rocket', 'gear', 'target'],
  [
    [3, 18, 34, -8, 'gold'],
    [2.6, 54, 50, 6, 'soft', 'md'],
    [4.4, 88, 24, -12],
    [38, 7, 26, 10, '', 'md'],
    [52, 11, 38, -6, 'soft', 'lg'],
    [66, 6, 22, 12, '', 'lg'],
    [28, 96, 30, -10, 'gold', 'md'],
    [56, 97, 22, 8, '', 'md'],
    [84, 96, 36, -4, 'soft', 'md'],
    // Phones: top corner and the bottom gap
    [90, 3.5, 22, -6],
    [12, 98, 22, 8],
  ]
);

/* ---------- Signed-in pages and the public pages ---------- */

// Margins first (left column ~3%, right column ~97%, outer columns for very wide screens), then a few
// spots in places that are often empty on that page.
const margins = (ys: number[], wide: number[]): Spot[] => [
  // Left margin: clear of the short dotted trail on the left edge, so these stay small (up to 36px)
  ...ys.map((y, i): Spot => [i % 2 ? 4.8 : 4.2, y, [34, 24, 30, 28, 36, 22, 32, 26][i % 8], [-8, 10, -4, 12, -12, 6, 8, -10][i % 8], (['soft', '', '', 'gold', '', 'soft', '', ''] as const)[i % 8]]),
  // Right margin: inside the page edge and the scrollbar
  ...ys.map((y, i): Spot => [i % 2 ? 95.6 : 95, Math.min(97, y + 6), [26, 40, 22, 42, 30, 36, 24, 38][i % 8], [10, -6, 14, -10, 6, -12, 4, 8][i % 8], (['', 'gold', '', 'soft', '', '', 'soft', ''] as const)[i % 8]]),
  // Very wide screens: a second column further in
  ...wide.map((y, i): Spot => [i % 2 ? 91 : 9, y, [30, 44, 24, 36][i % 4], [6, -8, 12, -4][i % 4], (['', 'soft', 'gold', ''] as const)[i % 4], 'lg']),
];

export const DASHBOARD_ICONS = build(
  ['target', 'lightbulb', 'trophy', 'note', 'rocket', 'compass', 'checklist', 'barChart', 'flag', 'user', 'chat', 'gear', 'pin', 'pencil'],
  [...margins([8, 30, 52, 74, 94], [16, 46, 80]), [72, 1.6, 22, 8, '', 'md'], [86, 97, 26, -6, 'gold', 'md'], [55, 98, 22, 10, '', 'md']]
);

export const COURSE_ICONS = build(
  ['kanban', 'phone', 'lightbulb', 'note', 'compass', 'search', 'calendar', 'checklist', 'puzzle', 'pieChart', 'cursor', 'flag', 'gear'],
  [...margins([3, 13, 23, 33, 43, 53, 63, 73, 83, 93], [7, 30, 54, 78]), [70, 0.8, 24, 6, '', 'md']]
);

export const ACTIVITY_ICONS = build(
  ['calendar', 'lineChart', 'trophy', 'flag', 'target', 'checklist', 'barChart', 'pin', 'rocket', 'lightbulb', 'gear', 'note'],
  [...margins([4, 18, 32, 46, 60, 74, 88], [12, 40, 68, 92]), [40, 1.2, 26, -8, 'gold', 'md'], [62, 1, 22, 10, '', 'md'], [84, 1.6, 30, -6, 'soft', 'md']]
);

export const CASE_STUDY_ICONS = build(
  ['search', 'puzzle', 'pieChart', 'lightbulb', 'funnel', 'note', 'target', 'compass', 'chat', 'barChart', 'trophy', 'pencil'],
  [...margins([5, 20, 35, 50, 65, 80, 94], [14, 42, 70, 92])]
);

export const LIVE_SESSION_ICONS = build(
  ['chat', 'phone', 'user', 'lightbulb', 'calendar', 'plane', 'rocket', 'pin', 'target', 'note', 'cursor', 'trophy'],
  [...margins([5, 20, 35, 50, 65, 80, 94], [12, 40, 68, 90]), [64, 1.4, 24, 8, '', 'md'], [82, 1.8, 30, -6, 'soft', 'md']]
);

export const LOGIN_ICONS = build(
  ['lightbulb', 'compass', 'rocket', 'target', 'note', 'flag', 'chat', 'pin', 'user', 'plane', 'trophy', 'pencil'],
  [
    [8, 12, 40, -8, 'soft'],
    [20, 30, 26, 10],
    [10, 52, 48, -6, 'gold', 'md'],
    [22, 74, 30, 12, '', 'md'],
    [9, 90, 24, -10],
    [80, 10, 30, 8, 'gold'],
    [92, 28, 44, -6, 'soft', 'md'],
    [78, 46, 24, 12, '', 'md'],
    [90, 66, 36, -10, '', 'md'],
    [80, 88, 28, 6, 'soft'],
    [50, 4, 22, -6, '', 'md'],
    [50, 96, 26, 10, 'gold', 'md'],
  ]
);

export const PRIVACY_ICONS = build(
  ['note', 'pin', 'lightbulb', 'checklist', 'compass', 'chat', 'flag', 'pencil', 'target', 'gear'],
  [...margins([6, 22, 38, 54, 70, 86], [14, 46, 78]), [16, 4, 30, -6, 'soft', 'lg'], [84, 6, 24, 10, '', 'lg'], [84, 40, 40, -8, 'gold', 'lg'], [16, 60, 36, 8, '', 'lg']]
);
