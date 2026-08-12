# ProdPath — AI Agent Knowledge Base & Architectural Reference (AI Reference)

> **Target Audience**: Future AI Coding Assistants, LLM Pair Programmers, Automated Agents  
> **Document Purpose**: Complete contextual knowledge base enabling any AI agent to understand, maintain, refactor, and extend ProdPath without needing to re-explore the codebase.  
> **Repository Path**: `d:\ProdPath`  

---

## 1. Executive Context & Core Philosophy

### What is ProdPath?
ProdPath is an interactive, local-first 4-week Product Management learning hub built with **Next.js 15.1.12 (App Router)**, **React 19.0.0**, **TypeScript**, **Tailwind CSS**, and **Three.js WebGL GPGPU Shaders** ([LiquidEther.tsx](file:///d:/ProdPath/src/components/LiquidEther.tsx)).

### Core Engineering Pillars
1. **Local-First Architecture**: User progress (`completedIds`) and user-added items (`customResources`) MUST always persist in browser `localStorage`. No mandatory server authentication exists.
2. **Static Export Compatibility**: The application MUST build cleanly with `next.config.mjs` setting `output: 'export'`. Never introduce server-side features (`getServerSideProps`, Node.js file system runtime handlers) that break static deployment.
3. **Data-Driven Curriculum**: Static learning content MUST remain decoupled from UI components inside [src/data/weeks.json](file:///d:/ProdPath/src/data/weeks.json), [liveSessions.json](file:///d:/ProdPath/src/data/liveSessions.json), [caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json), and [schedule.json](file:///d:/ProdPath/src/data/schedule.json). Note: There is no `resources.json` file on disk; learning resources are dynamically flattened in memory from `weeks.json`, `liveSessions.json`, and `caseStudies.json` via [ProgressContext.tsx](file:///d:/ProdPath/src/context/ProgressContext.tsx).

---

## 2. Non-Negotiable Core Rules for AI Agents

```
┌────────────────────────────────────────────────────────────────────────┐
│                      STRICT AI AGENT RULES                             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. NEVER break static HTML export ('output: export' in next.config).   │
│ 2. ALWAYS add 'use client'; at line 1 of interactive React components. │
│ 3. NEVER alter localStorage keys ('prodpath_completed_ids_v1').        │
│ 4. ALWAYS preserve fallback for legacy keys ('pm_hub_completed_ids_v1')│
│ 5. NEVER add compulsory login walls or break offline availability.    │
│ 6. ALWAYS maintain 100% strict TypeScript types in curriculum.ts.     │
│ 7. ALWAYS enforce Space Grotesk (headings), Inter (body), and Mono.    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture & File Locations Quick Index

- **Application Shell & Layout**: [src/app/layout.tsx](file:///d:/ProdPath/src/app/layout.tsx)
- **Global State Context**: [src/context/ProgressContext.tsx](file:///d:/ProdPath/src/context/ProgressContext.tsx)
- **Domain Interfaces**: [src/types/curriculum.ts](file:///d:/ProdPath/src/types/curriculum.ts)
- **Dashboard Route (`/`)**: [src/app/page.tsx](file:///d:/ProdPath/src/app/page.tsx)
- **Curriculum Route (`/course`)**: [src/app/course/page.tsx](file:///d:/ProdPath/src/app/course/page.tsx) (Horizontal week-tab navigation with Day-by-Day task list)
- **Resources Route (`/resources`)**: [src/app/resources/page.tsx](file:///d:/ProdPath/src/app/resources/page.tsx) (Search & multi-filter for articles, videos, playlists, case studies)
- **Live Sessions Route (`/live-sessions`)**: [src/app/live-sessions/page.tsx](file:///d:/ProdPath/src/app/live-sessions/page.tsx)
- **Schedule Route (`/schedule`)**: [src/app/schedule/page.tsx](file:///d:/ProdPath/src/app/schedule/page.tsx) (Vertical timeline rail + nodes roadmap)
- **Case Studies Data**: [src/data/caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json)
- **WebGL Fluid Component**: [src/components/LiquidEther.tsx](file:///d:/ProdPath/src/components/LiquidEther.tsx)

---

## 4. State Management & Storage Rules

### Storage Key Standards
- `STORAGE_KEY_COMPLETED` = `'prodpath_completed_ids_v1'`
- `STORAGE_KEY_CUSTOM` = `'prodpath_custom_resources_v1'`
- `LEGACY_STORAGE_KEY_COMPLETED` = `'pm_hub_completed_ids_v1'`
- `LEGACY_STORAGE_KEY_CUSTOM` = `'pm_hub_custom_resources_v1'`

### State Hydration & Resource Flattening Pattern
When modifying `ProgressContext.tsx`:
1. Always load storage inside a `useEffect` after client mount (`isLoaded` pattern).
2. `completedIds` MUST be instantiated as a native JavaScript `Set<string>` for $O(1)$ lookup performance.
3. Resources are dynamically generated in memory via `getAllResources()`, which flattens:
   - All day tasks from [weeks.json](file:///d:/ProdPath/src/data/weeks.json)
   - All masterclasses from [liveSessions.json](file:///d:/ProdPath/src/data/liveSessions.json)
   - All case studies from [caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json)
   - All user custom additions from `customResources` state
4. When serializing `completedIds` to `localStorage`, convert to array using `JSON.stringify(Array.from(completedIds))`.

---

## 5. Visual & UI Guidelines

- **Color System**:
  - Dark Mode background: `#0a0a0f` (deep near-black base with `#12121a` surface cards).
  - Light Mode background: `#faf9f6` (warm off-white background with neutral card surfaces).
  - Primary Accent: **Electric Violet** (`#8b5cf6`) used exclusively for CTAs, checkmarks, progress bars, active states, and focus rings.
- **Typography Stack**:
  - Display / Headings: **Space Grotesk** (`font-display`) with `-0.015em` letter-spacing.
  - Body Text: **Inter** (`font-sans`) for paragraphs, descriptions, card takeaways, and modal inputs.
  - Data / Badges: **JetBrains Mono** (`font-mono`) for dates, percentages, stats, and metadata tags.
- **Icons**: Always use `lucide-react`.
- **Micro-Animations**:
  - Task completion uses `canvas-confetti`.
  - Checkbox pop animation uses Tailwind class `animate-pop` (`@keyframes pop` defined in `tailwind.config.ts`).

---

## 6. Safe Areas to Refactor vs. High-Risk Areas

### Safe Areas for AI Modification
- **Styling & Layout Tweaks**: Modifying Tailwind classes in presentational components (`ResourceCard.tsx`, `Navbar.tsx`, `ProgressBar.tsx`).
- **Static Curriculum Data**: Adding or updating JSON items in [src/data/weeks.json](file:///d:/ProdPath/src/data/weeks.json), [src/data/liveSessions.json](file:///d:/ProdPath/src/data/liveSessions.json), or [src/data/caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json).
- **New Filter Options**: Adding new UI dropdown filters in [src/app/resources/page.tsx](file:///d:/ProdPath/src/app/resources/page.tsx).

### High-Risk Areas (Require Extra Caution)
- **`ProgressContext.tsx`**: Contains calculation math, storage sync, and custom resource creation. Modifying function signatures can break stats calculation across all pages.
- **`LiquidEther.tsx`**: Complex Three.js WebGL GPGPU shader logic. Modifying framebuffer size calculations (`calcSize()`) or uniform arrays can cause WebGL context loss or black screens.
- **`BorderGlow.tsx`**: Interactive pointer-proximity card border glow component. Modifying custom CSS variables (`--edge-proximity`, `--cursor-angle`) impacts mouse tracking and cone spread geometry.
- **`DotGrid.tsx`**: HTML5 Canvas 2D spring physics & shockwave grid component. Modifying `requestAnimationFrame` loop or `ResizeObserver` handlers affects high-DPI scaling.
- **`next.config.mjs`**: Contains static export configuration (`output: 'export'`). Never remove this unless cloud server infrastructure is explicitly provisioned.
