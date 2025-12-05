# QA Manual Test Plan - TubeDigest PWA

## Test Environment Setup

### Prerequisites
- ✅ Backend URL configured in `.env` file
- ✅ Dev server running (`pnpm dev`)
- ✅ Browser: Chrome/Edge (for PWA features) or Firefox/Safari
- ✅ Network: Stable internet connection
- ✅ Apps Script backend: Deployed and accessible

### Test Environment
- **Frontend URL**: `http://localhost:5173`
- **Backend URL**: Check `.env` for `VITE_BACKEND_URL`

---

## Docker Testing

### Test D1: Local Docker Run
**Steps:**
1. Configure `.env` with `BACKEND_BASE_URL`.
2. Run `docker compose up --build`.
3. Open `http://localhost:5173`.

**Expected:**
- ✅ App loads successfully.
- ✅ `window.__TUBEDIGEST_CONFIG__` exists in console.
- ✅ API calls go to the URL defined in `.env`.

---

## Test Scenarios

### 1. Today's Digest Page (`/`)

#### Test 1.1: Page Load
**Steps:**
1. Open browser to `http://localhost:5173`
2. Observe initial load

**Expected:**
- ✅ Page loads within 2-3 seconds
- ✅ Loading spinner appears briefly
- ✅ API call visible in Network tab: `GET ?action=listVideos&range=7d`
- ✅ Video cards render if data exists
- ✅ Default tab is "7 Days"

**Error Case:**
- ❌ If backend unreachable: See error message "Unable to connect to server. Please check your internet connection."
- ❌ If rate limited: See "Too many requests. Please wait a moment and try again."

#### Test 1.2: Tab Switching
**Steps:**
1. Click "3 Days" tab
2. Click "Today" tab
3. Click back to "7 Days"

**Expected:**
- ✅ Each click triggers new API call with correct `range` parameter
- ✅ Video list updates to match date range
- ✅ Active tab has blue background
- ✅ Loading spinner shows during fetch

**API Calls:**
- 3 Days: `GET ?action=listVideos&range=3d`
- Today: `GET ?action=listVideos&range=today`
- 7 Days: `GET ?action=listVideos&range=7d`

#### Test 1.3: Status Filter
**Steps:**
1. Click "New" chip in Status filter row
2. Click "Read" chip
3. Click "All" to reset

**Expected:**
- ✅ New: Shows only videos with `status='new'`
- ✅ Read: Shows only videos with `status='read'`
- ✅ All: Shows all videos
- ✅ Each click triggers API call: `GET ?action=listVideos&range=7d&status=new`

#### Test 1.4: Priority Filter
**Steps:**
1. Click "High" in Priority filter row
2. Click "Medium"
3. Click "Low"
4. Click "All"

**Expected:**
- ✅ API calls include `&priority=high`, `&priority=medium`, `&priority=low`
- ✅ Video cards show only matching priority badges

#### Test 1.5: Video Card Actions
**Steps:**
1. Click "YouTube" button on any video card
2. Click "Details" button on any video card

**Expected:**
- ✅ YouTube: Opens `https://youtube.com/watch?v={videoId}` in new tab
- ✅ Details: Navigates to `/videos/{id}` page

---

### 2. Videos List Page (`/videos`)

#### Test 2.1: Page Load and Search
**Steps:**
1. Navigate to `/videos` via bottom nav
2. Type "react" in search box
3. Clear search

**Expected:**
- ✅ All videos load on mount
- ✅ Search filters client-side (no API call)
- ✅ Matches title, channel name, or description
- ✅ Empty state shows if no matches: "No videos found"

#### Test 2.2: Date Range Filter
**Steps:**
1. Click "Today" in Date Range row
2. Click "3 Days"
3. Click "Week"
4. Click "2 Weeks"
5. Click "Month"

**Expected:**
- ✅ Each triggers API call with correct range
- ✅ API: `GET ?action=listVideos&range=today` (etc.)

#### Test 2.3: Combined Filters
**Steps:**
1. Set Date Range: "Week"
2. Set Status: "New"
3. Set Priority: "High"
4. Set Channel: (pick any channel)

**Expected:**
- ✅ API call: `GET ?action=listVideos&range=7d&status=new&priority=high&channelId={id}`
- ✅ Results match all filters

#### Test 2.4: Load More (Pagination)
**Steps:**
1. Scroll to bottom
2. Click "Load More" button (if visible)

**Expected:**
- ✅ Currently: "Load More" is hidden (pagination not implemented)
- ✅ Future: Would fetch next page

**Note:** Backend pagination support is pending. See `videosStore.ts` TODO.

---

### 3. Video Details Page (`/videos/:id`)

#### Test 3.1: Page Load
**Steps:**
1. From digest or videos list, click "Details" on a video
2. Observe page load

**Expected:**
- ✅ API call: `GET ?action=getVideo&videoId={id}`
- ✅ Large thumbnail loads (or 🎬 emoji if no thumbnail)
- ✅ Duration overlay shows (e.g., "12:34")
- ✅ Title, channel name, publish date render
- ✅ Priority badge (High/Medium/Low)
- ✅ Status badge (NEW or READ)
- ✅ Category tag (if assigned)

#### Test 3.2: Summary Accordions
**Steps:**
1. Expand "📝 Short Summary" (default open)
2. Expand "📄 Medium Summary"
3. Expand "📚 Full Summary"
4. Expand "💡 Key Ideas"
5. Expand "✅ Action Items" (if exists)

**Expected:**
- ✅ Each section expands/collapses on click
- ✅ Summaries show full text (may be multi-paragraph)
- ✅ Key Ideas: Bullet list with blue bullets
- ✅ Action Items: Checkboxes (local state only)

#### Test 3.3: Mark as Read
**Steps:**
1. Ensure video status is "NEW"
2. Toggle "Mark as Read"
3. Navigate back to digest

**Expected:**
- ✅ API call: `POST ?action=markVideoRead` with `{videoId: "..."}`
- ✅ Toggle becomes disabled
- ✅ Badge changes from "NEW" to "READ"
- ✅ On digest: Video card now shows "READ" badge

#### Test 3.4: Action Buttons
**Steps:**
1. Click "🎬 Open in YouTube"
2. Click "▶️ Play Here"

**Expected:**
- ✅ YouTube: Opens video in new tab
- ✅ Play Here: Disabled (future feature)

---

### 4. Channels List Page (`/channels`)

#### Test 4.1: Page Load
**Steps:**
1. Navigate to `/channels`

**Expected:**
- ✅ API call: `GET ?action=listChannels`
- ✅ All subscribed channels render
- ✅ Each shows: channel initial (gradient avatar), name, video count, new video count badge

#### Test 4.2: Search Channels
**Steps:**
1. Type "tech" in search box
2. Clear search

**Expected:**
- ✅ Client-side filtering (no API call)
- ✅ Matches channel name or tags
- ✅ Instant results

#### Test 4.3: Filter by New Videos
**Steps:**
1. Toggle "Only show channels with new videos"
2. Toggle off

**Expected:**
- ✅ ON: API call `GET ?action=listChannels&onlyWithNew=true`
- ✅ Shows only channels with `newVideoCount > 0`
- ✅ OFF: Shows all channels

---

### 5. Activity & Logs Page (`/activity`)

#### Test 5.1: Page Load
**Steps:**
1. Navigate to `/activity`

**Expected:**
- ✅ API call: `GET ?action=listRuns&limit=10`
- ✅ "Last Run" summary card shows:
  - Time since last run (e.g., "2 hours ago")
  - Status badge (Success/Failed/Running)
  - Stats: Subscriptions, Channels, Videos processed
- ✅ Run history list shows up to 10 entries

#### Test 5.2: Run Log Details
**Steps:**
1. Review each log entry

**Expected:**
- ✅ Each shows: Date, Time, 4-column stats grid
- ✅ Status badge color-coded (green=success, red=failed, yellow=running)
- ✅ Duration formatted (e.g., "5m 30s")

#### Test 5.3: Error Display
**Steps:**
1. Find a failed run (if exists)

**Expected:**
- ✅ Red error box shows below stats
- ✅ Error message is readable

#### Test 5.4: Load More
**Steps:**
1. Scroll to bottom
2. Click "Load More" (if visible)

**Expected:**
- ✅ API call: `GET ?action=listRuns&limit=20`
- ✅ Additional runs appear
- ✅ Button hides when no more logs

---

### 6. Settings Page (`/settings`)

#### Test 6.1: Page Load
**Steps:**
1. Navigate to `/settings`

**Expected:**
- ✅ API call: `GET ?action=getBackendInfo`
- ✅ All sections render:
  - Preferences (2 toggles)
  - Appearance (3 theme buttons)
  - Backend Info (API version, schedule, sheet ID)
  - About (app logo, version)

#### Test 6.2: Preferences
**Steps:**
1. Toggle "Sort high priority first"
2. Toggle "Show only last 7 days"
3. Refresh page

**Expected:**
- ✅ Changes persist (localStorage)
- ✅ Values remain after refresh

#### Test 6.3: Theme Switcher
**Steps:**
1. Click "☀️ Light"
2. Click "🌙 Dark"
3. Click "🖥️ System"

**Expected:**
- ✅ Light: Entire app switches to light mode
- ✅ Dark: Entire app switches to dark mode
- ✅ System: Follows OS preference
- ✅ Preference persists on refresh

#### Test 6.4: Backend Info
**Steps:**
1. Review backend info section

**Expected:**
- ✅ API Version: (e.g., "1.0.0")
- ✅ Schedule: (e.g., "Daily at 08:00, 20:00 Europe/Istanbul")
- ✅ Sheet ID: Shows Google Sheet ID or "-"

**Error Case:**
- ❌ If backend unavailable: "Backend info unavailable" + Retry button

---

## Error Handling Test Cases

### Test E1: Network Offline
**Steps:**
1. Disconnect internet
2. Navigate between pages

**Expected:**
- ✅ Error message: "Unable to connect to server. Please check your internet connection."
- ✅ Retry button appears
- ✅ App shell still works (PWA cached)

### Test E2: Backend Down (500 Error)
**Steps:**
1. Simulate backend returning 500 (modify Apps Script to throw error)

**Expected:**
- ✅ Error: "Server error. The backend may be temporarily unavailable."
- ✅ Empty state with retry action

### Test E3: Rate Limiting (429 Error)
**Steps:**
1. Make many rapid requests

**Expected:**
- ✅ Error: "Too many requests. Please wait a moment and try again."

### Test E4: Invalid Response
**Steps:**
1. Backend returns malformed JSON

**Expected:**
- ✅ Error: "Invalid JSON response from server"

---

## Performance Test Cases

### Test P1: Initial Load Time
**Metric:** Time to First Contentful Paint (FCP)
**Expected:** < 1.5 seconds

### Test P2: API Response Time
**Metric:** Time for `listVideos` to complete
**Expected:** < 3 seconds (depends on backend/LLM processing)

### Test P3: Route Transitions
**Metric:** Time between clicking nav and page render
**Expected:** < 300ms (instant for client-side routing)

---

## PWA Test Cases

### Test PWA1: Install Prompt
**Steps:**
1. Visit site in Chrome
2. Wait for install prompt

**Expected:**
- ✅ "Add to Home Screen" prompt appears
- ✅ Can install as standalone app

### Test PWA2: Offline Access
**Steps:**
1. Install PWA
2. Go offline
3. Open app

**Expected:**
- ✅ App shell loads
- ✅ Shows cached pages
- ✅ API calls fail gracefully

### Test PWA3: Service Worker Update
**Steps:**
1. Deploy new version
2. Open app

**Expected:**
- ✅ Update detected
- ✅ Prompt to refresh
- ✅ New version loads

---

## Cross-Browser Test Matrix

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Primary dev browser |
| Edge | ✅ | ✅ | Chromium-based |
| Firefox | ✅ | ✅ | Test dark mode |
| Safari | ✅ | ✅ | iOS primary |

---

## Sign-Off Criteria

- [ ] All 6 pages load without errors
- [ ] API calls use correct action parameters
- [ ] Error states show user-friendly messages
- [ ] Theme switcher works in all modes
- [ ] Mark as Read persists to backend
- [ ] Search and filters work correctly
- [ ] PWA can be installed
- [ ] Responsive on mobile (375px - 768px - 1920px)

---

## Known Issues & Limitations

1. **Pagination**: Backend doesn't support offset-based pagination yet. "Load More" is placeholder.
2. **Action Items**: Checkboxes are local-only, not synced to backend.
3. **Video Playback**: "Play Here" button disabled (YouTube-only for now).
4. **Real-time Updates**: No WebSocket/polling. Manual refresh required.

---

## Reporting Bugs

When reporting issues, include:
- **Browser/Version**: e.g., Chrome 120
- **URL**: Current page
- **Steps to Reproduce**: Detailed steps
- **Expected vs Actual**: What should happen vs what did happen
- **Screenshots**: If applicable
- **Network Tab**: Failed API calls
- **Console Errors**: JavaScript errors
