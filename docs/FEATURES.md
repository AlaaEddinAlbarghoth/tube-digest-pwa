# TubeDigest PWA - Features

## Overview

TubeDigest is a mobile-first PWA for viewing AI-generated summaries of YouTube subscription videos. This document describes features by page.

---

## 📅 Today Digest (`/`)

The main landing page showing recent videos with an intuitive digest-style interface.

### Features
- **Time Tabs** - Quick toggle between time ranges:
  - 7 Days (default)
  - 3 Days
  - Today
- **Status Filter** - Filter by video status:
  - All
  - New (unread)
  - Read
  - Processed (summarized)
- **Priority Filter** - Filter by AI-assigned priority:
  - All
  - High (important topics)
  - Medium (worth watching)
  - Low (optional)
- **Accurate Video Sorting** - Videos are sorted by Date+Time (newest first) with precise timestamp ordering
- **Video Cards** - Each card shows:
  - Channel avatar (first letter)
  - Channel name
  - Video title (2-line max)
  - Time ago (relative date)
  - Duration
  - Priority badge (color-coded)
  - NEW/READ/PROCESSED status badge
  - Short summary excerpt (2-line max)
  - Quick action buttons: YouTube, Details

### User Actions
- Tap "YouTube" → Opens video on YouTube
- Tap "Details" → Opens video details page
- Scroll down → Load more videos

---

## 🎬 Videos (`/videos`)

Full video archive with advanced filtering and search capabilities.

### Features
- **Search Bar** - Full-text search across:
  - Video titles
  - Channel names
  - Summaries (client-side)
- **Advanced Filters**
  - Date Range: Today, 3 Days, Week, 2 Weeks, Month
  - Status: All, New, Processed, Read
  - Priority: All, High, Medium, Low
  - Channel: Filter by specific channel
- **Accurate Video Sorting** - Videos sorted by Date+Time (newest first) ensuring the most recent content appears at the top
- **Sticky Filter Bar** - Filters remain visible while scrolling
- **Load More** - Pagination for large result sets
- **Empty State** - Helpful message when no videos match filters

### User Actions
- Type in search → Instant filtering
- Tap filter chip → Toggle filter
- Tap "Load More" → Fetch next page
- Tap video card → Open details

---

## 📖 Video Details (`/videos/:id`)

Comprehensive video summary view with all AI-generated content.

### Features
- **Hero Section**
  - Large thumbnail image
  - Duration overlay
  - Back button
- **Metadata Badges**
  - Priority level
  - Status (NEW/READ)
  - Category (if assigned)
- **Video Info**
  - Full title
  - Channel name with avatar
  - Publication date (absolute + relative)
- **Action Buttons**
  - Open in YouTube (primary)
  - Play Here (placeholder for future)
- **Summary Accordions** (expandable sections)
  - 📝 Short Summary - Quick 1-2 sentence overview
  - 📄 Medium Summary - Detailed 1-2 paragraph summary
  - 📚 Full Summary - Complete transcript summary
  - 💡 Key Ideas - Bullet points of main insights
  - ✅ Action Items - Checkbox list of actionable takeaways
- **Mark as Read Toggle** - Marks video as read in backend

### User Actions
- Tap accordion → Expand/collapse section
- Check action item → Track personal progress
- Toggle "Mark as Read" → Updates status
- Tap "Open in YouTube" → Watch original video

---

## 📺 Channels (`/channels`)

List of subscribed YouTube channels with activity stats.

### Features
- **Search Bar** - Filter channels by name
- **Toggle Filter** - "Only show channels with new videos"
- **Channel Cards** - Each card shows:
  - Channel avatar (first letter, gradient background)
  - Channel name
  - Total video count
  - New video count (badge)
  - Tags (if assigned)
- **Visual Indicators**
  - Gradient avatars for visual distinction
  - "X new" badge for channels with unread videos

### User Actions
- Type in search → Filter channels
- Toggle "Only with new" → Show active channels only
- Scroll to browse all channels

---

## 📊 Activity & Logs (`/activity`)

Backend processing history and run statistics.

### Features
- **Last Run Summary Card**
  - Beautiful gradient header
  - Time since last run (relative)
  - Status badge (Success/Failed/Running)
  - Key stats:
    - Subscriptions checked
    - Channels with new videos
    - New videos processed
- **Run History List**
  - Date and time
  - Four-column stats grid:
    - Subs (subscriptions checked)
    - Channels (with new videos)
    - Videos (processed)
    - Duration (seconds/minutes)
  - Status badge
  - Error message (if failed)
- **Load More** - Pagination for historical runs

### User Actions
- Tap "Refresh" → Reload activity data
- Tap "Load More" → See older runs
- Review error messages → Debug failed runs

---

## ⚙️ Settings (`/settings`)

User preferences and app configuration.

### Features
- **Preferences Section**
  - Sort high priority first (toggle)
  - Show only last 7 days (toggle)
- **Appearance Section**
  - Theme selector (3 options):
    - 🖥️ System (follows OS preference)
    - ☀️ Light
    - 🌙 Dark
  - Visual card selection UI
- **Backend Info Section**
  - API Version
  - Processing schedule
  - Sheet ID (if applicable)
  - Connection status
- **Cache Management**
  - Reset App Cache button - Clears Service Worker, Workbox caches, localStorage, and IndexedDB for complete cache reset
- **About Section**
  - App logo and name
  - Version number
  - App description
  - GitHub link

### User Actions
- Toggle preferences → Instantly applied
- Select theme → Immediately changes appearance
- Tap "View on GitHub" → Opens repo

---

## 🌐 PWA Features

### Installation
- Install prompt on mobile browsers
- Add to Home Screen
- Full-screen app experience

### Offline Support
- App shell cached for offline access
- Graceful offline fallback
- Online status detection

### Auto-Updates
- Service worker detects new versions
- User prompted to refresh
- Seamless update experience

---

## 🎨 Design Features

### Dark Mode
- System-aware theme detection
- Manual override in settings
- Consistent dark palette

### Responsive Layout
- Mobile-first design
- Bottom navigation on mobile
- Flexible grid layouts

### Animations
- Smooth transitions
- Loading spinners
- Skeleton states (planned)

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus indicators
- Semantic HTML

---

## 📱 Navigation

### Bottom Navigation Bar (5 tabs)
| Tab | Icon | Route |
|-----|------|-------|
| Today | 📅 | `/` |
| Videos | 🎬 | `/videos` |
| Channels | 📺 | `/channels` |
| Activity | 📊 | `/activity` |
| More | ⚙️ | `/settings` |

### Top Bar
- Dynamic title (changes per page)
- App logo
- Settings shortcut

---

## ✅ Recent Features

- ✅ **Accurate Video Sorting** - Videos sorted by Date+Time (newest first) with precise timestamp ordering from Videos sheet
- ✅ **Enhanced Status Filtering** - Supports PROCESSED status from Videos sheet with proper status mapping
- ✅ **Complete Cache Reset** - Settings page includes comprehensive cache clearing (SW, Workbox, localStorage, IndexedDB)

## 🔮 Planned Features

- [ ] Push notifications for new videos
- [ ] Video playback within app
- [ ] Offline video summary caching
- [ ] Swipe gestures for quick actions
- [ ] Batch mark as read
- [ ] Channel priority settings
- [ ] Custom categories
- [ ] Export/share summaries
- [ ] Reading time estimates
- [ ] Video recommendations
