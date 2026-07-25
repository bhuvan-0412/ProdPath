# ProdPath — Personal Product Management Learning Tracker

ProdPath is a modern, self-contained, trackable Product Management learning platform. It provides a structured 4-week curriculum, an on-demand live session watch list, a chronological timeline schedule, and a searchable resource library with custom link support.

## 🚀 Features

- **Structured 4-Week Curriculum**: Day-by-day learning tasks, curated articles, videos, and playlists.
- **Live Sessions**: On-demand watch list featuring recorded PM masterclasses and expert talks.
- **Resource Library**: Search and filter all learning resources by week, type, or completion status, plus add your own custom resources.
- **Timeline Schedule**: Chronological roadmap with milestone assessments and capstone project tracking.
- **Progress Persistence**: All completion states and custom resources persist locally via `localStorage`.
- **Responsive & Dark Mode**: Dynamic, modern UI with Tailwind CSS, dark mode support, and micro-animations.

---

## 🛠️ Local Development

### Prerequisites

- Node.js (v18.x or higher)
- npm or pnpm

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📦 Production Build & Export

To create an optimized production build:

```bash
npm run build
```

This builds and exports static HTML/JS files to the `out/` directory ready for any static web host.

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Option 2: Git Integration

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects Next.js settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `out` (or default Next.js output)
4. Click **Deploy**.
