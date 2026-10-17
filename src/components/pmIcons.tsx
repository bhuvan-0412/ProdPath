import React from 'react';

// Outline PM icons (24x24, drawn with the current color) shared by the landing icon field and PageBackdrop

export type IconKind = 'lightbulb' | 'target' | 'flag' | 'chart' | 'note' | 'cursor' | 'search' | 'puzzle' | 'chat';

export const ICON_PATHS: Record<IconKind, React.ReactNode> = {
  lightbulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h12l-2.5 4L17 12H5" />,
  chart: <path d="M4 20h16M7 16v-5M12 16V7M17 16v-8" />,
  note: <path d="M5 4h14v10l-5 5H5zM14 19v-5h5" />,
  cursor: <path d="M5 3l6.5 16 2.3-6.7L20.5 10z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </>
  ),
  puzzle: <path d="M5 5h4.5a2.2 2.2 0 1 1 4 0H18v4.5a2.2 2.2 0 1 1 0 4V18h-4.5a2.2 2.2 0 1 0-4 0H5v-4.5a2.2 2.2 0 1 0 0-4z" />,
  chat: <path d="M4 5h16v11h-9l-5 4v-4H4z" />,
};
