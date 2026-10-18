'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type HeatMapData, type HeatCell, shortDate } from '@/lib/activity';

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
const CELL_W = 'w-[22px] sm:w-7 lg:w-[34px]';
const CELL = `${CELL_W} h-[22px] sm:h-7 lg:h-[34px] rounded-[4px]`;
const GAP = 'gap-1 sm:gap-[5px] lg:gap-1.5';
// Stays pinned on the left while the grid scrolls sideways on phones
const LABEL_COL = 'w-8 flex-shrink-0 sticky left-0 z-[1] bg-surface shadow-[6px_0_0_0_rgb(var(--surface))]';

const describe = (cell: HeatCell) => {
  const when = shortDate(cell.date);
  if (cell.count === 0) return `No activity on ${when}`;
  return `${cell.count} ${cell.count === 1 ? 'item' : 'items'} on ${when}`;
};

interface HeatMapProps {
  data: HeatMapData;
}

// GitHub-style grid: 7 rows (Mon-Sun) x one column per week, newest week on the right.
// Keyboard: one square is in the Tab order; arrow keys move between days, Home/End jump to the ends.
export const HeatMap: React.FC<HeatMapProps> = ({ data }) => {
  const { weeks, monthLabels } = data;
  const scrollRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());

  // Position lookup: key -> [column, row]
  const positions = useMemo(() => {
    const map = new Map<string, [number, number]>();
    weeks.forEach((column, c) => column.forEach((cell, r) => cell && map.set(cell.key, [c, r])));
    return map;
  }, [weeks]);

  const todayKey = useMemo(() => weeks.flat().find((cell) => cell?.isToday)?.key, [weeks]);
  const [focusKey, setFocusKey] = useState<string | undefined>(todayKey);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => setFocusKey(todayKey), [todayKey]);

  // Phones: start scrolled to the most recent week
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [weeks]);

  const moveFocus = (key: string) => {
    setFocusKey(key);
    setActiveKey(key);
    cellRefs.current.get(key)?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, cell: HeatCell) => {
    const [c, r] = positions.get(cell.key)!;
    const at = (col: number, row: number) => weeks[col]?.[row] ?? null;
    let next: HeatCell | null = null;
    if (e.key === 'ArrowRight') next = at(c + 1, r);
    else if (e.key === 'ArrowLeft') next = at(c - 1, r);
    else if (e.key === 'ArrowDown') next = at(c, r + 1);
    else if (e.key === 'ArrowUp') next = at(c, r - 1);
    else if (e.key === 'Home') next = weeks[0].find(Boolean) ?? null;
    else if (e.key === 'End') next = todayKey ? at(...positions.get(todayKey)!) : null;
    else if (e.key === 'Escape') {
      setActiveKey(null);
      return;
    } else return;
    e.preventDefault();
    if (next) moveFocus(next.key);
  };

  // Tooltip: below the square for the top two rows, above it otherwise; kept inside the grid at the edges
  const active = activeKey ? weeks.flat().find((cell) => cell?.key === activeKey) ?? null : null;
  const activeEl = activeKey ? cellRefs.current.get(activeKey) : undefined;
  const tooltip = (() => {
    if (!active || !activeEl) return null;
    const [c, r] = positions.get(active.key)!;
    const below = r < 2;
    const x = activeEl.offsetLeft + activeEl.offsetWidth / 2;
    const y = below ? activeEl.offsetTop + activeEl.offsetHeight + 6 : activeEl.offsetTop - 6;
    const shiftX = c < 2 ? '-20%' : c > weeks.length - 3 ? '-80%' : '-50%';
    return { text: describe(active), style: { left: x, top: y, transform: `translate(${shiftX}, ${below ? '0' : '-100%'})` } };
  })();

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar py-1">
        <div className="relative w-max pr-1">
          {/* Month labels */}
          <div aria-hidden="true" className={`flex ${GAP} mb-1.5`}>
            <span className={LABEL_COL} />
            {weeks.map((_, c) => {
              const label = monthLabels.find((m) => m.column === c)?.label;
              return (
                <span key={c} className={`${CELL_W} relative h-4 text-[11px] leading-4 text-muted`}>
                  {label && <span className="absolute left-0 top-0 whitespace-nowrap">{label}</span>}
                </span>
              );
            })}
          </div>

          <div role="grid" aria-label="Items completed per day, last 12 weeks" className={`flex flex-col ${GAP}`}>
            {WEEKDAYS.map((weekday, r) => (
              <div key={r} role="row" className={`flex items-center ${GAP}`}>
                <span aria-hidden="true" className={`${LABEL_COL} self-stretch flex items-center text-[11px] text-muted leading-none`}>
                  {weekday}
                </span>
                {weeks.map((column, c) => {
                  const cell = column[r];
                  if (!cell) return <span key={c} aria-hidden="true" className={CELL} />;
                  const label = describe(cell) + (cell.isToday ? ', today' : '');
                  return (
                    <div
                      key={cell.key}
                      ref={(el) => {
                        if (el) cellRefs.current.set(cell.key, el);
                        else cellRefs.current.delete(cell.key);
                      }}
                      role="gridcell"
                      tabIndex={cell.key === focusKey ? 0 : -1}
                      aria-label={label}
                      onMouseEnter={() => setActiveKey(cell.key)}
                      onMouseLeave={() => setActiveKey((k) => (k === cell.key ? null : k))}
                      onFocus={() => {
                        setFocusKey(cell.key);
                        setActiveKey(cell.key);
                      }}
                      onBlur={() => setActiveKey((k) => (k === cell.key ? null : k))}
                      onKeyDown={(e) => handleKeyDown(e, cell)}
                      className={`${CELL} heat-${cell.level} ${
                        cell.isToday ? 'ring-2 ring-ink ring-offset-1 ring-offset-surface' : ''
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {tooltip && (
            <div
              role="presentation"
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-paper shadow-offset"
              style={tooltip.style}
            >
              {tooltip.text}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div aria-hidden="true" className="mt-4 flex items-center justify-end gap-1.5 text-[11px] text-muted">
        <span className="mr-1">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`w-3.5 h-3.5 rounded-[3px] heat-${level}`} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
};
