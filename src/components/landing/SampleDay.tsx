'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import './reducedMotion';
import { Check } from 'lucide-react';

// The "A day on ProdPath" sample card. It server-renders with the first item done; in the browser it starts
// empty and ticks each item in turn when it scrolls into view, with the progress bar filling to match.
// With reduced motion it simply shows every item ticked.

interface SampleTask {
  label: string;
  resources: { id: string; title: string; typeLabel: string }[];
}

interface SampleDayProps {
  dayNumber: number;
  brief: string;
  tasks: SampleTask[];
}

const TICK_MS = 550;

export const SampleDay: React.FC<SampleDayProps> = ({ dayNumber, brief, tasks }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const order = tasks.flatMap((t) => t.resources.map((r) => r.id));
  const total = order.length;
  const [done, setDone] = useState(1);

  useEffect(() => {
    if (reduce) {
      setDone(total);
      return;
    }
    if (!inView) {
      setDone(0);
      return;
    }
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setDone(count);
      if (count >= total) window.clearInterval(timer);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [inView, reduce, total]);

  const isDone = (id: string) => order.indexOf(id) < done;

  return (
    <div ref={ref} className="rounded-card border border-line bg-surface">
      <div className="px-5 py-4 border-b border-line flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-dark">Week 1 &middot; Day {dayNumber}</p>
          <p className="mt-1 font-display text-xl font-semibold text-ink">{brief}</p>
        </div>
        <span className="text-xs text-muted whitespace-nowrap pt-0.5 tabular-nums">
          {done} of {total} done
        </span>
      </div>
      <div className="h-1 bg-paper overflow-hidden" aria-hidden="true">
        <div
          className="h-full w-full bg-accent origin-left transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${total ? done / total : 0})` }}
        />
      </div>
      <div className="p-4 space-y-3">
        {tasks.map((task) => (
          <div key={task.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">{task.label}</p>
            <ul className="space-y-1.5">
              {task.resources.map((res) => {
                const ticked = isDone(res.id);
                const first = res.id === order[0];
                return (
                  <li key={res.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-line bg-paper/60">
                    <span aria-hidden="true" className="relative flex-shrink-0">
                      <span
                        className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center transition-colors duration-200 ${
                          ticked ? 'bg-accent border-accent text-paper' : 'border-ink/50 bg-surface'
                        }`}
                      >
                        {ticked && <Check className="w-3.5 h-3.5 stroke-[3] animate-pop" />}
                      </span>
                      {/* Hand-drawn loop around the first ticked box */}
                      {ticked && first && (
                        <svg viewBox="0 0 40 40" focusable="false" className="pointer-events-none absolute -left-[8px] -top-[8px] w-[36px] h-[36px] text-accent">
                          <path
                            d="M26.5 5.5 C 17 2.8, 5.6 7.6, 4.6 18.4 C 3.7 28.8, 12.4 36.2, 21.8 35.2 C 31.6 34.2, 36.8 26.4, 35.4 17 C 34.4 10.6, 29.4 6.4, 20.4 6.8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </span>
                    {/* Title, with its type on the same line to the right */}
                    <span className="min-w-0 flex-1 flex items-baseline justify-between gap-3">
                      <span className={`min-w-0 text-sm font-medium transition-colors ${ticked ? 'text-muted line-through' : 'text-ink'}`}>
                        {res.title}
                        {ticked && <span className="sr-only"> (done)</span>}
                      </span>
                      <span className="flex-shrink-0 text-xs text-muted">{res.typeLabel}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
