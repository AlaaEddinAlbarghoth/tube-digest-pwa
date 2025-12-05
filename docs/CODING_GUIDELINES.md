# TubeDigest PWA - Coding Guidelines

## TypeScript Strictness

### Compiler Settings
The project uses strict TypeScript settings:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Rules

1. **No `any` Types**
   ```typescript
   // ❌ Bad
   const data: any = fetchData();

   // ✅ Good
   const data: VideoSummary = fetchData();
   ```

2. **Explicit Return Types on Functions**
   ```typescript
   // ❌ Bad
   function getVideos() { ... }

   // ✅ Good
   function getVideos(): Promise<VideoSummary[]> { ... }
   ```

3. **Use Type Imports**
   ```typescript
   // ❌ Bad
   import { VideoSummary } from '@/types/video';

   // ✅ Good (when only using as type)
   import type { VideoSummary } from '@/types/video';
   ```

4. **Prefer Interfaces Over Types for Objects**
   ```typescript
   // ✅ Preferred for object shapes
   interface VideoSummary {
     id: string;
     title: string;
   }

   // ✅ Use type for unions, primitives
   type Priority = 'high' | 'medium' | 'low';
   ```

---

## Component Structure

### Presentational Components (Dumb)
Located in `src/components/shared/` and `src/components/features/`

**Characteristics:**
- Receive data via props
- No direct store access
- No side effects
- Focus on rendering UI

**Example:**
```tsx
// src/components/shared/Badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'error';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={variants[variant]}>
      {children}
    </span>
  );
}
```

### Container Components (Smart)
Located in `src/pages/`

**Characteristics:**
- Access stores directly
- Handle data fetching
- Manage local UI state
- Compose presentational components

**Example:**
```tsx
// src/pages/TodayDigestPage/TodayDigestPage.tsx
export function TodayDigestPage() {
  const { videos, loading, fetchVideos } = useVideosStore();
  
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {videos.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
```

### File Naming
- Components: `PascalCase.tsx` (e.g., `VideoCard.tsx`)
- Stores: `camelCaseStore.ts` (e.g., `videosStore.ts`)
- API modules: `camelCaseApi.ts` (e.g., `videosApi.ts`)
- Types: `camelCase.ts` (e.g., `video.ts`)

---

## Zustand Usage Patterns

### Store Structure
```typescript
interface YourState {
  // Data
  items: Item[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
  clearError: () => void;
}

export const useYourStore = create<YourState>((set, get) => ({
  // Initial state
  items: [],
  loading: false,
  error: null,
  
  // Actions
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await YourApi.getItems();
      set({ items, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
  
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  
  clearError: () => set({ error: null }),
}));
```

### Selecting State
```typescript
// ✅ Good - Select only what you need
const videos = useVideosStore((state) => state.videos);
const loading = useVideosStore((state) => state.loading);

// ❌ Avoid - Selecting entire store causes unnecessary re-renders
const store = useVideosStore();
```

### Actions Outside Components
```typescript
// Access store actions without hooks
const { fetchVideos } = useVideosStore.getState();
fetchVideos();
```

### Persistence
```typescript
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'tube-digest-settings',
    }
  )
);
```

---

## API Error Handling

### Error Class
```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Client Pattern
```typescript
async function get<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }
  
  const json = await response.json();
  
  if (!json.success) {
    throw new ApiError(400, json.error || 'Unknown error');
  }
  
  return json.data as T;
}
```

### Store Error Handling
```typescript
fetchVideos: async () => {
  set({ loading: true, error: null });
  try {
    const videos = await VideosApi.getVideos();
    set({ videos, loading: false });
  } catch (err) {
    // Handle both ApiError and generic errors
    const message = err instanceof ApiError 
      ? err.message 
      : 'Network error. Please try again.';
    set({ error: message, loading: false });
  }
}
```

### UI Feedback
Always show errors to users:
```tsx
if (error) {
  return (
    <EmptyState
      title="Something went wrong"
      description={error}
      action={<Button onClick={retry}>Try Again</Button>}
    />
  );
}
```

---

## Tailwind Usage

### Design Tokens
Use semantic values, not magic numbers:

```tsx
// ❌ Bad - Magic values
<div className="p-[17px] text-[#1a2b3c] rounded-[7px]">

// ✅ Good - Use Tailwind tokens
<div className="p-4 text-gray-900 rounded-lg">
```

### Spacing Scale
| Class | Value |
|-------|-------|
| `p-1` | 0.25rem (4px) |
| `p-2` | 0.5rem (8px) |
| `p-3` | 0.75rem (12px) |
| `p-4` | 1rem (16px) |
| `p-6` | 1.5rem (24px) |
| `p-8` | 2rem (32px) |

### Dark Mode
Always include dark variants:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

### Responsive Design
Mobile-first approach:
```tsx
// Base styles for mobile, then larger screens
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Component Styling with clsx
```typescript
import clsx from 'clsx';

<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium',
    variant === 'primary' && 'bg-blue-600 text-white',
    variant === 'outline' && 'border border-gray-300',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
>
```

### Avoid Inline Styles
```tsx
// ❌ Bad
<div style={{ marginTop: '20px', color: 'red' }}>

// ✅ Good
<div className="mt-5 text-red-500">
```

---

## Import Organization

Order imports as follows:
```typescript
// 1. React
import { useEffect, useState } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

// 3. Stores
import { useVideosStore } from '@/state/videosStore';

// 4. API
import { VideosApi } from '@/api/videosApi';

// 5. Components
import { Button } from '@/components/shared/Button';
import { VideoCard } from '@/components/features/VideoCard';

// 6. Types
import type { VideoSummary } from '@/types/video';
```

---

## Best Practices

### 1. Keep Components Small
- One responsibility per component
- Extract reusable pieces
- Max ~150 lines per component

### 2. Use Path Aliases
```typescript
// ✅ Good
import { Button } from '@/components/shared/Button';

// ❌ Bad
import { Button } from '../../../components/shared/Button';
```

### 3. Memoize Expensive Computations
```typescript
const filteredVideos = useMemo(
  () => videos.filter(v => v.title.includes(search)),
  [videos, search]
);
```

### 4. Handle Loading States
Always show loading indicators:
```tsx
if (loading) return <LoadingSpinner />;
```

### 5. Handle Empty States
Show helpful messages when no data:
```tsx
if (items.length === 0) {
  return <EmptyState title="No items" />;
}
```

### 6. Accessibility
- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
```tsx
<button aria-label="Close modal" onClick={onClose}>
  ×
</button>
```
