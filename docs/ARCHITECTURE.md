# TubeDigest PWA - Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TubeDigest PWA (React)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      UI Layer (React)                         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │  │
│  │  │   Pages     │ │  Features   │ │    Shared Components    │  │  │
│  │  │ TodayDigest │ │  VideoCard  │ │ Button, Badge, Card,    │  │  │
│  │  │ VideosList  │ │  RunLogItem │ │ Toggle, Chip, etc.      │  │  │
│  │  │ VideoDetail │ │  FilterBar  │ │                         │  │  │
│  │  │ Channels    │ │             │ │                         │  │  │
│  │  │ Activity    │ │             │ │                         │  │  │
│  │  │ Settings    │ │             │ │                         │  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └───────────┬─────────────┘  │  │
│  └─────────┼───────────────┼────────────────────┼────────────────┘  │
│            │               │                    │                   │
│            ▼               ▼                    ▼                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  State Layer (Zustand Stores)                 │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐  │  │
│  │  │videosStore  │ │channelsStore│ │  logsStore  │ │settings │  │  │
│  │  │             │ │             │ │             │ │Store    │  │  │
│  │  │• videos     │ │• channels   │ │• logs       │ │         │  │  │
│  │  │• filters    │ │• search     │ │• summary    │ │• prefs  │  │  │
│  │  │• loading    │ │• onlyWithNew│ │• pagination │ │• theme  │  │  │
│  │  │• actions    │ │• actions    │ │• actions    │ │• backend│  │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └────┬────┘  │  │
│  └─────────┼───────────────┼───────────────┼─────────────┼───────┘  │
│            │               │               │             │          │
│            ▼               ▼               ▼             ▼          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    API Layer (HTTP Client)                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐  │  │
│  │  │ videosApi   │ │ channelsApi │ │   logsApi   │ │settings │  │  │
│  │  │ • getVideos │ │• getChannels│ │• getRunLogs │ │Api      │  │  │
│  │  │ • getDetails│ │             │ │• getSummary │ │         │  │  │
│  │  │ • markRead  │ │             │ │             │ │• getInfo│  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘  │  │
│  │                          │                                    │  │
│  │                ┌─────────▼─────────┐                          │  │
│  │                │     client.ts     │                          │  │
│  │                │  • Base URL       │                          │  │
│  │                │  • Error handling │                          │  │
│  │                │  • Type safety    │                          │  │
│  │                └─────────┬─────────┘                          │  │
│  └──────────────────────────┼────────────────────────────────────┘  │
│                             │                                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Google Apps Script Backend                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │   Web App (doGet) │  │  YouTube Data API │  │   LLM (Gemini)  │  │
│  │   • REST endpoint │  │  • Subscriptions  │  │   • Summarize   │  │
│  │   • CORS handling │  │  • Videos         │  │   • Key ideas   │  │
│  └─────────┬─────────┘  └─────────┬─────────┘  └────────┬────────┘  │
│            │                      │                      │          │
│            ▼                      ▼                      ▼          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Google Sheets                            │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │  │
│  │  │  Videos   │  │ Channels  │  │   Runs    │  │  Config   │   │  │
│  │  │   Sheet   │  │   Sheet   │  │   Sheet   │  │   Sheet   │   │  │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Backend API

The Google Apps Script backend exposes a REST-like API through the `doGet` and `doPost` web app functions.

### Base URL

The API is accessed via the deployed Apps Script Web App URL. The PWA reads this from `BACKEND_BASE_URL` environment variable (injected at runtime via `config.js`).

### Request Format

All requests use query parameters with `action` as the router:
```
GET  {baseUrl}?action={actionName}&param1=value1&param2=value2
POST {baseUrl}?action={actionName}  (with JSON body)
```

### Response Format

**Success:**
```json
{
  "videos": [...],    // or "channels", "runs", etc.
  "lastRun": {...}    // for listRuns
}
```

**Error:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Available Actions

| Action | Method | Description |
|--------|--------|-------------|
| `listChannels` | GET | List all channels with video counts |
| `listVideos` | GET | List videos with optional filters |
| `getVideo` | GET | Get single video details |
| `markVideoRead` | POST | Mark a video as read |
| `listRuns` | GET | Get execution run logs |
| `getBackendInfo` | GET | Get backend configuration info |

### Key Parameters

**listVideos:**
- `range`: `today`, `3d`, `7d` (default), `14d`, `30d`
- `status`: `all` (default), `new`, `processed`, `read`
- `priority`: `all` (default), `low`, `medium`, `high`
- `channelId`: Filter by channel
- `category`: Filter by category

**listChannels:**
- `onlyWithNew`: `true`/`false` - Show only channels with new videos

**listRuns:**
- `limit`: Number of runs to return (default: 20)

---

## Data Flow

### 1. Fetching Videos

```
User opens app
     │
     ▼
TodayDigestPage.useEffect()
     │
     ▼
videosStore.fetchVideos()
     │
     ├── Set loading: true
     │
     ▼
VideosApi.getVideos(filters)
     │
     ▼
client.get('?action=listVideos&...')
     │
     ▼
Apps Script returns JSON
     │
     ▼
Store updates: videos, videoIds, loading: false
     │
     ▼
React re-renders with new data
```

### 2. Marking Video as Read

```
User clicks "Mark as Read"
     │
     ▼
Local state update (optimistic)
     │
     ▼
videosStore.markAsRead(id)
     │
     ├── Update local video status immediately
     │
     ▼
VideosApi.markVideoRead(id)
     │
     ▼
Backend updates Sheet
     │
     ▼
Success (or rollback on error)
```

---

## Folder Responsibilities

| Folder | Purpose |
|--------|---------|
| `src/app/` | Application entry point, routing, theme management |
| `src/pages/` | Full-page components bound to routes. Each page fetches data via stores. |
| `src/components/layout/` | App shell: TopBar, BottomNav, AppLayout |
| `src/components/features/` | Feature-specific components: VideoCard, RunLogItem |
| `src/components/shared/` | Reusable UI primitives: Button, Badge, Card, Toggle, etc. |
| `src/state/` | Zustand stores. Each store manages data, loading, errors, and actions. |
| `src/api/` | HTTP client and endpoint wrappers. All network calls go through here. |
| `src/types/` | TypeScript interfaces for data models (Video, Channel, RunLog, etc.) |
| `src/config/` | App constants (default filters, API paths) |
| `src/styles/` | Global CSS, Tailwind imports |
| `src/pwa/` | Service worker registration |

---

## Pagination Strategy

### Videos Store
- Uses **offset-based pagination** (page number + page size)
- `fetchVideos()` resets to page 1
- `fetchNextPage()` increments page and appends results
- `hasMore` flag indicates if more pages exist

### Logs Store
- Uses **limit-based pagination** (Load More pattern)
- Initial fetch: 10 logs
- Each "Load More": increases limit by 10
- All logs are stored; new fetch replaces previous

---

## Filter Handling

### Client-Side Filters
- **Search** - Filters by title/channel name locally (no API call)
- Works on already-fetched data for instant feedback

### Server-Side Filters
- **Date Range** - `today`, `3d`, `7d`, `14d`, `30d`
- **Status** - `all`, `new`, `processed`, `read`
- **Priority** - `all`, `high`, `medium`, `low`
- **Channel ID** - Filter by specific channel
- **Category** - Filter by content category

When any server-side filter changes:
1. Store calls `setFilters()`
2. Store triggers `fetchVideos()` automatically
3. API request includes filter parameters
4. Results replace existing data

---

## 7-Day Window Default

The default date range is **7 days** (`7d`), which:
- Reduces initial load size
- Shows recent content by default
- Aligns with typical consumption patterns

Users can expand to 14 or 30 days as needed.

---

## State Persistence

### Settings Store (Persisted)
- Uses Zustand's `persist` middleware
- Stored in **localStorage** under key `tube-digest-settings`
- Persisted data:
  - `theme` (system | light | dark)
  - `sortHighPriorityFirst` (boolean)
  - `showOnlyLast7Days` (boolean)

### Other Stores (Not Persisted)
- Videos, Channels, Logs are fetched fresh on each session
- This ensures data freshness

---

## Error Handling & Resilience

### 1. Error Flow
The application uses a centralized error handling strategy that propagates from the API client up to the UI.

```
API Response (Apps Script)
     │
     ▼
src/api/client.ts
• Detects HTTP errors (4xx, 5xx)
• Detects App-level errors ({ error: "..." })
• Wraps in ApiError class with user-friendly message
     │
     ▼
Zustand Store (e.g., videosStore)
• Catches ApiError
• Calls error.getUserMessage()
• Sets state.error = "User friendly message"
• Sets state.loading = false
     │
     ▼
React Component (Page)
• Reads state.error
• Renders <EmptyState /> with error message
• Provides "Try Again" button
```

### 2. Common Failure Modes

| Failure Mode | Cause | User Message |
|--------------|-------|--------------|
| **Network Error** | Offline / DNS | "Unable to connect to server. Please check your internet connection." |
| **Rate Limit** | Too many requests | "Too many requests. Please wait a moment and try again." |
| **Server Error** | Apps Script crash | "Server error. The backend may be temporarily unavailable." |
| **App Error** | Invalid params | Specific error message from backend (e.g., "Video not found") |

### 3. Resilience Strategies

- **Graceful Degradation**: If one API call fails (e.g., backend info), the rest of the app (e.g., video list) continues to function.
- **Optimistic Updates**: "Mark as Read" updates the UI immediately. If the API call fails, the change is rolled back and an error is shown.
- **User-Initiated Retries**: All error states include a retry button to allow the user to recover from transient errors.
- **PWA Caching**: The app shell is cached, so the app loads even if offline (though data fetching will fail with a clear message).

### 4. UI Feedback Components

- **Loading**: `<LoadingSpinner />` - Shown during all async operations.
- **Error**: `<EmptyState variant="error" />` - Shown when data fetching fails.
- **Empty**: `<EmptyState variant="default" />` - Shown when filters return no results.

---

## Theme Management

### Detection
1. Check user preference in settingsStore
2. If `system`, detect OS preference via `prefers-color-scheme`
3. Apply `.dark` class to `<html>` element

### Application
- Tailwind's dark mode uses class strategy
- All components use `dark:` variants
- Theme changes apply instantly via CSS

---

## Runtime Config & Dockerization

### 1. Runtime Configuration
To allow the same Docker image to run in different environments (staging, production) without rebuilding, configuration is injected at runtime.

#### Flow
```
Container Start
     │
     ▼
entrypoint.sh runs
     │
     ├── Reads BACKEND_BASE_URL, APP_ENV from environment
     │
     ▼
envsubst generates config.js from config.template.js
     │
     ▼
Nginx starts serving
     │
     ▼
Browser loads index.html
     │
     ├── Loads config.js (sets window.__TUBEDIGEST_CONFIG__)
     │
     ▼
React app initializes
     │
     ├── API client calls getBackendBaseUrl()
     ├── runtimeConfig.ts reads from window.__TUBEDIGEST_CONFIG__ (lazy)
     │
     ▼
API requests use full Apps Script URL
```

#### Key Files
- **`public/config.template.js`**: Template with `${BACKEND_BASE_URL}` placeholders
- **`entrypoint.sh`**: Generates `config.js` from template using env vars
- **`src/config/runtimeConfig.ts`**: Reads config lazily (on first API call, not at module load)
- **`src/config/constants.ts`**: `API_CONFIG.baseUrl` is a getter that calls `getBackendBaseUrl()`

#### Why Lazy Loading?
The config is read **lazily** (on first access) rather than at module load time. This ensures `config.js` has loaded and set `window.__TUBEDIGEST_CONFIG__` before the app tries to read it.

### 2. Docker Architecture
The application is containerized using a multi-stage build:

1.  **Builder Stage**: Node.js image builds the Vite app (`pnpm build`).
2.  **Runtime Stage**: Nginx Alpine image serves the static assets.
    - Custom `nginx.conf` handles SPA routing (fallback to index.html).
    - `entrypoint.sh` handles config generation on startup.

### 3. Dokploy Integration
- **Build Type**: Dockerfile
- **Port**: 80
- **Env Vars**: `BACKEND_BASE_URL`, `APP_ENV` set in Dokploy dashboard.

---

## PWA Configuration

### Service Worker
- Generated by `vite-plugin-pwa`
- Caches static assets (app shell)
- Network-first strategy for API calls

### Manifest
- App name: TubeDigest
- Theme color: #135bec
- Background: #0a0a0a
- Icons: Various sizes for different platforms

### Update Flow
1. New SW detected
2. User prompted to refresh
3. Page reloads with new version
