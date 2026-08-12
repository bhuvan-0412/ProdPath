# ProdPath — Developer Onboarding & Contribution Handbook (Developer Guide)

> **Document Status**: Active Developer Guide  
> **Repository Path**: `d:\ProdPath`  
> **Target Audience**: Software Engineers, Frontend Developers, Open-Source Contributors  

---

## Table of Contents
1. [Welcome & Onboarding Summary](#1-welcome--onboarding-summary)
2. [Local Development Setup](#2-local-development-setup)
3. [Architecture & Key File Registry](#3-architecture--key-file-registry)
4. [How State & Persistence Work](#4-how-state--persistence-work)
5. [How-To Guides (Extending ProdPath)](#5-how-to-guides-extending-prodpath)
   - [How to Add a New Page](#how-to-add-a-new-page)
   - [How to Edit or Add Curriculum Items](#how-to-edit-or-add-curriculum-items)
   - [How to Add a Case Study](#how-to-add-a-case-study)
   - [How to Modify the Theme Palette & Design System](#how-to-modify-the-theme-palette--design-system)
6. [Coding Standards & Conventions](#6-coding-standards--conventions)
7. [Debugging Workflows](#7-debugging-workflows)
8. [Build & Deployment Procedures](#8-build--deployment-procedures)

---

## 1. Welcome & Onboarding Summary

Welcome to **ProdPath**! ProdPath is a modern, self-contained Product Management learning application built with **Next.js 15.1.12 (App Router)**, **React 19.0.0**, **TypeScript**, **Tailwind CSS**, and **Three.js (WebGL Shaders)**.

### Key Philosophy
- **Zero Backend Needed**: ProdPath compiles into static HTML/JS assets (`output: 'export'`).
- **Local-First Persistence**: State (completed task IDs and custom links) is stored in browser `localStorage`.
- **JSON Data-Driven**: Curriculum content lives in static JSON files in `src/data/` (`weeks.json`, `liveSessions.json`, `caseStudies.json`, `schedule.json`). There is no `resources.json` file on disk; learning resources are flattened dynamically in memory via `ProgressContext.tsx`.

---

## 2. Local Development Setup

### Prerequisites
- **Node.js**: Version `18.x` or higher (`v20.x` recommended).
- **Package Manager**: `npm` (or `pnpm`).

### Step-by-Step Setup
```bash
# 1. Clone or navigate to project workspace
cd d:\ProdPath

# 2. Install NPM dependencies
npm install

# 3. Start Next.js development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

### Running Type Checks & Production Build
```bash
npx tsc --noEmit
npm run build
```
Always run type checks and static production build verification before committing changes.

---

## 3. Architecture & Key File Registry

| File Path | Role | Description |
| :--- | :--- | :--- |
| [src/app/layout.tsx](file:///d:/ProdPath/src/app/layout.tsx) | Root Layout Shell | Wraps app in `ProgressProvider`, mounts `Navbar` and `Footer`, sets `#0a0a0f` / `#faf9f6` background tokens. |
| [src/context/ProgressContext.tsx](file:///d:/ProdPath/src/context/ProgressContext.tsx) | Core State Engine | Manages `completedIds` Set, `customResources` array, flattens datasets, and syncs `localStorage`. |
| [src/data/weeks.json](file:///d:/ProdPath/src/data/weeks.json) | Static Curriculum | Stores 4-week structured curriculum data (weeks, days, tasks, resources). |
| [src/data/liveSessions.json](file:///d:/ProdPath/src/data/liveSessions.json) | Masterclasses Data | Stores recorded live session talks and speaker info. |
| [src/data/caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json) | Case Studies Data | Stores curated PM case studies (`cs-1`..`cs-4`) with summaries and bulleted takeaways. |
| [src/data/schedule.json](file:///d:/ProdPath/src/data/schedule.json) | Timeline Roadmap | Stores 28-day chronological schedule items. |
| [src/types/curriculum.ts](file:///d:/ProdPath/src/types/curriculum.ts) | TypeScript Models | Interfaces for `Resource`, `ResourceType` (`'article' | 'video' | 'playlist' | 'case-study'`), `Week`, `Day`, `Task`, `LiveSession`, `ScheduleItem`. |
| [src/app/course/page.tsx](file:///d:/ProdPath/src/app/course/page.tsx) | Curriculum Route | Horizontal Week Navigation Tabs with Day-by-Day task list underneath active tab. |
| [src/app/schedule/page.tsx](file:///d:/ProdPath/src/app/schedule/page.tsx) | Schedule Route | Elegantly styled vertical timeline rail + nodes roadmap with session badges. |
| [src/components/LiquidEther.tsx](file:///d:/ProdPath/src/components/LiquidEther.tsx) | WebGL Fluid Canvas | GPGPU Three.js WebGL fluid motion shader component. |
| [src/components/BorderGlow.tsx](file:///d:/ProdPath/src/components/BorderGlow.tsx) | Interactive Card Glow | Pointer-proximity mesh gradient border glow component wrapper. |
| [src/components/DotGrid.tsx](file:///d:/ProdPath/src/components/DotGrid.tsx) | Interactive Dot Grid | HTML5 Canvas 2D spring-mass dot grid canvas component. |

---

## 4. How State & Persistence Work

All user completion states and custom links are managed inside [src/context/ProgressContext.tsx](file:///d:/ProdPath/src/context/ProgressContext.tsx):

```typescript
const STORAGE_KEY_COMPLETED = 'prodpath_completed_ids_v1';
const STORAGE_KEY_CUSTOM = 'prodpath_custom_resources_v1';
```

- When the app mounts, a `useEffect` reads these keys from `localStorage`.
- Calling `toggleCompleted(id)` adds or removes the `id` from the `completedIds` React `Set` state.
- `getAllResources()` flattens `weeks.json`, `liveSessions.json`, `caseStudies.json`, and `customResources` dynamically in memory.
- A secondary `useEffect` listens to `completedIds` changes and serializes the Set to `localStorage` automatically.

---

## 5. How-To Guides (Extending ProdPath)

### How to Add a New Page
1. Create a directory inside `src/app/` (e.g., `src/app/tools/`).
2. Add a `page.tsx` file:
   ```tsx
   'use client';
   import React from 'react';

   export default function ToolsPage() {
     return (
       <div className="space-y-6 animate-fade-in">
         <h1 className="font-display text-2xl font-bold">PM Tooling Suite</h1>
       </div>
     );
   }
   ```
3. Add the route to `navLinks` in [src/components/Navbar.tsx](file:///d:/ProdPath/src/components/Navbar.tsx#L13):
   ```typescript
   { href: '/tools', label: 'Tools', icon: Wrench }
   ```

### How to Edit or Add Curriculum Items
To add a new article or video to Week 1:
1. Open [src/data/weeks.json](file:///d:/ProdPath/src/data/weeks.json).
2. Locate `week-1` -> target `day` (e.g. Day 1) -> target `tasks` array.
3. Append a new resource object:
   ```json
   {
     "id": "w1d1_3",
     "title": "New PM Guide Article Title",
     "url": "https://example.com/pm-guide",
     "type": "article",
     "notes": "Optional brief note"
   }
   ```

### How to Add a Case Study
1. Open [src/data/caseStudies.json](file:///d:/ProdPath/src/data/caseStudies.json).
2. Append a new case study object:
   ```json
   {
     "id": "cs-5",
     "title": "Case Study Title Here",
     "summary": "One-line executive summary...",
     "takeaways": [
       "Key takeaway point 1",
       "Key takeaway point 2"
     ],
     "url": "https://example.com/case-study",
     "type": "case-study",
     "weekId": "week-2"
   }
   ```

### How to Modify the Theme Palette & Design System
- Primary Accent: Defined as `accent` scale (`#8b5cf6` electric violet) in [tailwind.config.ts](file:///d:/ProdPath/tailwind.config.ts).
- Fonts: Defined in [globals.css](file:///d:/ProdPath/src/app/globals.css) via `@import` Google Fonts:
  - `font-display`: Space Grotesk
  - `font-sans`: Inter
  - `font-mono`: JetBrains Mono

---

## 6. Coding Standards & Conventions

- **Component Formatting**: Use Functional Components with `React.FC` or standard function declarations. Add `'use client';` directive at line 1 for interactive components.
- **Naming Conventions**:
  - Components: `PascalCase` (e.g. `ResourceCard.tsx`, `AddResourceModal.tsx`).
  - Files & Folders: `camelCase` or `kebab-case` for app routes (`live-sessions/`).
  - Variables & Functions: `camelCase` (e.g. `getWeekStats`, `toggleCompleted`, `getCaseStudyStats`).
- **Styling**: Use utility-first Tailwind CSS. Use dark mode variants (`dark:bg-[#12121a] dark:text-zinc-100`).

---

## 7. Debugging Workflows

### Inspecting Local Progress State
Open browser Developer Tools -> **Application** tab -> **Local Storage** -> `http://localhost:3000`:
- `prodpath_completed_ids_v1`: View stringified array of completed IDs.
- `prodpath_custom_resources_v1`: View custom resource objects.
- To reset state during testing, execute `localStorage.clear()` in Console and refresh.

---

## 8. Build & Deployment Procedures

### Static Production Export
```bash
npm run build
```
This compiles the application and writes static production assets into the `/out` directory.

### Deploying to Vercel
1. Push workspace repository to GitHub main branch.
2. Vercel automatically triggers and runs `npm run build`.
3. Verify live deployment URL.
