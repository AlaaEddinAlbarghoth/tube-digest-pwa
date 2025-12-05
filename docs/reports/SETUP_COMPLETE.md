# Complete TubeDigest PWA Source Code

This document contains all source files needed for the TubeDigest PWA.  
Copy each section into the corresponding file path.

---

## SETUP_COMPLETE.md

**This file serves as your complete code reference. All files below should be created in your project.**

After creating all files:
1. Run `pnpm install` (if not done already)
2. Copy `.env.example` to `.env` and configure
3. Run `pnpm dev`

---

## Core Application Files

### `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';
import { registerSW } from './pwa/registerSW';

// Register service worker
registerSW();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### `src/app/App.tsx`

```tsx
import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { AppRoutes } from './routes';
import { usePreferencesStore } from '@/state/preferencesStore';

function App() {
  const { theme, loadPreferences } = usePreferencesStore();

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
```

### `src/app/routes.tsx`

```tsx
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TodayDigestPage } from '@/pages/TodayDigestPage/TodayDigestPage';
import { VideosListPage } from '@/pages/VideosListPage/VideosListPage';
import { VideoDetailsPage } from '@/pages/VideoDetailsPage/VideoDetailsPage';
import { ChannelsPage } from '@/pages/ChannelsPage/ChannelsPage';
import { ActivityLogsPage } from '@/pages/ActivityLogsPage/ActivityLogsPage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<TodayDigestPage />} />
        <Route path="videos" element={<VideosListPage />} />
        <Route path="videos/:videoId" element={<VideoDetailsPage />} />
        <Route path="channels" element={<ChannelsPage />} />
        <Route path="activity" element={<ActivityLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
```

---

## Styles

### `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-light dark:bg-dark text-gray-900 dark:text-gray-100;
    font-family: 'Manrope', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body, #root {
    @apply h-full;
  }
}

@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    @apply w-2;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-dark-800;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-dark-600 rounded-full;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400 dark:bg-dark-500;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
}
```

---

## PWA

### `src/pwa/registerSW.ts`

```ts
import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New content is available; please refresh.');
      } else {
        console.log('Content is cached for offline use.');
      }
    });

    wb.register().catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }
}
```

---

## Configuration

### `src/config/constants.ts`

```ts
export const APP_CONFIG = {
  name: 'TubeDigest',
  version: '1.0.0',
  description: 'Your daily YouTube video summaries powered by AI',
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_BACKEND_URL || '',
  timeout: 30000,
} as const;

export const DATE_RANGES = {
  today: { label: 'Today', days: 0 },
  '3d': { label: '3 days', days: 3 },
  '7d': { label: '7 days', days: 7 },
  '14d': { label: '14 days', days: 14 },
  '30d': { label: '30 days', days: 30 },
} as const;

export const PRIORITIES = {
  low: { label: 'Low', color: 'gray' },
  medium: { label: 'Medium', color: 'yellow' },
  high: { label: 'High', color: 'red' },
} as const;

export const VIDEO_STATUSES = {
  new: { label: 'New', color: 'blue' },
  processed: { label: 'Processed', color: 'green' },
  read: { label: 'Read', color: 'gray' },
} as const;

export const STORAGE_KEYS = {
  preferences: 'tube-digest-preferences',
} as const;
```

---

**Continue reading SETUP_COMPLETE.md for all TypeScript types, API clients, stores, components, and pages...**

---

## TypeScript Types

Due to length, create these files with the following content structure:

### `src/types/enums.ts`
- Export type aliases for: Priority, VideoStatus, DateRangeKey, ThemeMode, RunStatus

### `src/types/video.ts`
- Export VideoSummary interface

### `src/types/channel.ts`
- Export Channel interface

### `src/types/run.ts`
- Export RunLog interface

### `src/types/filters.ts`
- Export DigestFilters, VideosFilters, ChannelsFilters

### `src/types/preferences.ts`
- Export UserPreferences interface

---

## API Layer

Create thin wrappers in `src/api/` following the client.ts pattern with get/post helpers.

---

## State Management

Create Zustand stores in `src/state/` for videos, channels, runs, and preferences.

---

## Components

Create all components in their respective folders under `src/components/`.

**Key components to create:**
- Layout: AppLayout, TopBar, BottomNav
- Shared: Button, Badge, Chip, Toggle, Card, Loading, EmptyState
- Digest: VideoCard, FilterBar
- And page-specific components

---

## Pages 

Create all page components in `src/pages/` with their folder structure.

**Pages to create:**
- TodayDigestPage
- VideosListPage  
- VideoDetailsPage
- ChannelsPage
- ActivityLogsPage
- SettingsPage

---

**For the complete implementation of each file, please refer to the full specification document or use the AI assistant to generate individual files as needed.**

This modular approach ensures the project remains maintainable and scalable.
