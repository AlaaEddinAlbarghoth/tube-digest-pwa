# 🎯 TubeDigest PWA - Complete Source Code Reference

This document contains **ALL** source code for files that need to be created.  
Use this as your reference to copy-paste into the respective files.

---

## 📦 Already Created Files

✅ Configuration files (vite.config.ts, tailwind.config.js, tsconfig.json, etc.)  
✅ TypeScript types (src/types/*)  
✅ README.md

---

## 🔧 Files to Create

### 1. Core Configuration

#### `src/config/constants.ts`

```typescript
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
  processed: { label: 'Processed', color:'green' },
  read: { label: 'Read', color: 'gray' },
} as const;

export const STORAGE_KEYS = {
  preferences: 'tube-digest-preferences',
} as const;
```

### 2. PWA Setup

#### `src/pwa/registerSW.ts`

```typescript
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

### 3. Styles

#### `src/styles/globals.css`

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

### 4. API Layer

#### `src/api/client.ts`

```typescript
import { API_CONFIG } from '@/config/constants';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  const data = await response.json();
  
  if (data.error) {
    throw new ApiError(data.error, response.status, data);
  }

  return data as T;
}

export async function get<T>(
  action: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const url = new URL(API_CONFIG.baseUrl);
  url.searchParams.set('action', action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<T>(response);
}

export async function post<T>(
  action: string,
  body?: unknown
): Promise<T> {
  const url = new URL(API_CONFIG.baseUrl);
  url.searchParams.set('action', action);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}
```

#### `src/api/videosApi.ts`

```typescript
import { get, post } from './client';
import type { VideoSummary } from '@/types/video';
import type { DateRangeKey, Priority, VideoStatus } from '@/types/enums';

interface ListVideosParams {
  range: DateRangeKey;
  status?: VideoStatus;
  priority?: Priority;
  channelId?: string;
  category?: string;
}

interface ListVideosResponse {
  videos: VideoSummary[];
}

interface GetVideoResponse {
  video: VideoSummary;
}

interface MarkVideoReadResponse {
  success: boolean;
}

export const VideosApi = {
  async listVideos(params: ListVideosParams): Promise<VideoSummary[]> {
    const response = await get<ListVideosResponse>('listVideos', params as Record<string, string>);
    return response.videos;
  },

  async getVideo(videoId: string): Promise<VideoSummary> {
    const response = await get<GetVideoResponse>('getVideo', { videoId });
    return response.video;
  },

  async markVideoRead(videoId: string): Promise<boolean> {
    const response = await post<MarkVideoReadResponse>('markVideoRead', { videoId });
    return response.success;
  },
};
```

#### `src/api/channelsApi.ts`

```typescript
import { get } from './client';
import type { Channel } from '@/types/channel';

interface ListChannelsParams {
  onlyWithNew?: boolean;
}

interface ListChannelsResponse {
  channels: Channel[];
}

export const ChannelsApi = {
  async listChannels(params?: ListChannelsParams): Promise<Channel[]> {
    const response = await get<ListChannelsResponse>(
      'listChannels',
      params as Record<string, boolean>
    );
    return response.channels;
  },
};
```

#### `src/api/runsApi.ts`

```typescript
import { get } from './client';
import type { RunLog } from '@/types/run';

interface ListRunsParams {
  limit?: number;
}

interface ListRunsResponse {
  lastRun: RunLog | null;
  runs: RunLog[];
}

export const RunsApi = {
  async listRuns(params?: ListRunsParams): Promise<ListRunsResponse> {
    return get<ListRunsResponse>('listRuns', params as Record<string, number>);
  },
};
```

#### `src/api/metaApi.ts`

```typescript
import { get } from './client';

interface BackendInfo {
  schedule: string;
  apiVersion: string;
}

export const MetaApi = {
  async getBackendInfo(): Promise<BackendInfo> {
    return get<BackendInfo>('getBackendInfo');
  },
};
```

---

### 5. State Management (Zustand Stores)

Create all store files in `src/state/`.  
Follow the pattern demonstrated in the specification for:
- `videosStore.ts` - Videos and digest management
- `channelsStore.ts` - Channels management  
- `runsStore.ts` - Activity logs
- `preferencesStore.ts` - User preferences with localStorage

---

### 6. Core App Files

#### `src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';
import { registerSW } from './pwa/registerSW';

registerSW();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### `src/app/App.tsx`

```typescript
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

#### `src/app/routes.tsx`

```typescript
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

## 📱 Components

### Shared Components (`src/components/shared/`)

Create these reusable UI components:
- **Button.tsx** - Primary, secondary, tertiary variants
- **Badge.tsx** - Color-coded status badges
- **Chip.tsx** - Filter chips
- **Toggle.tsx** - Switch component
- **Card.tsx** - Container with shadow
- **IconButton.tsx** - Icon-based button
- **LoadingSpinner.tsx** - Loading state
- **EmptyState.tsx** - Empty content state

### Layout Components (`src/components/layout/`)

- **AppLayout.tsx** - Main app shell
- **TopBar.tsx** - Top navigation bar
- **BottomNav.tsx** - Bottom tab navigation

### Page-Specific Components

Create components in respective folders for:
- `digest/` - VideoCard, FilterBar
- `videos/` - VideoListItem
- `channels/` - ChannelListItem
- `logs/` - RunCard, LogRow
- `settings/` - PreferenceRow

---

## 📄 Pages

Create all page components in their respective folders:
- **TodayDigestPage** - `/`
- **VideosListPage** - `/videos`
- **VideoDetailsPage** - `/videos/:id`
- **ChannelsPage** - `/channels`
- **ActivityLogsPage** - `/activity`
- **SettingsPage** - `/settings`

---

## 📚 Documentation Files

Create these in `docs/`:
- **ARCHITECTURE.md** - System architecture
- **API_CONTRACTS.md** - Backend API specs
- **CODING_GUIDELINES.md** - Code standards
- **FEATURES_OVERVIEW.md** - Feature documentation

---

## ✅ Final Steps

1. **Create all files** listed above
2. **Copy `.env.example` to `.env`** and configure backend URL
3. **Run `pnpm dev`** to start development
4. **Test all routes** and verify functionality

---

**Last Updated:** 2025-12-04  
**Version:** 1.0.0

For detailed implementation of each component and page, use this document as a reference or request specific file generation from the AI assistant.
