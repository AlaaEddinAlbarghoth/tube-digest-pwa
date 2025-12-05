# Deployment Checklist - TubeDigest PWA

## 1. Frontend Preparation

### Environment Configuration
- [ ] **`.env` File**: Ensure `VITE_BACKEND_URL` is set to the correct Apps Script deployment URL.
  ```env
  VITE_BACKEND_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
  ```
- [ ] **Build Check**: Run `pnpm build` locally to verify no errors.
  ```bash
  pnpm build
  ```
- [ ] **Lint Check**: Run `pnpm lint` to ensure code quality.
  ```bash
  pnpm lint
  ```
- [ ] **Type Check**: Run `pnpm tsc --noEmit` to verify TypeScript correctness.
  ```bash
  pnpm tsc --noEmit
  ```

### PWA Configuration
- [ ] **Manifest**: Verify `manifest.webmanifest` has correct name, icons, and theme colors.
- [ ] **Service Worker**: Ensure `sw.js` is generated during build.
- [ ] **Icons**: Confirm all icon sizes (192x192, 512x512) are present in `public/`.

---

## 2. Backend Verification (Google Apps Script)

### Deployment
- [ ] **Web App Deployment**: Deploy as "Web App".
- [ ] **Access Settings**: Set "Who has access" to "Anyone" (or specific users if authenticated).
- [ ] **Execute As**: Set "Execute as" to "Me" (your Google account).
- [ ] **Copy URL**: Copy the deployment URL (ends in `/exec`).

### Configuration
- [ ] **Script Properties**: Verify required properties are set in Project Settings > Script Properties:
  - `GEMINI_API_KEY`: Valid API key for Gemini.
  - `MISTRAL_API_KEY`: Valid API key for Mistral (if used).
  - `YOUTUBE_API_KEY`: Valid YouTube Data API key.
  - `SHEET_ID`: ID of the Google Sheet acting as database.

### Triggers
- [ ] **Time-Driven Triggers**: Confirm daily triggers are set:
  - Morning run: ~08:00 (Europe/Istanbul)
  - Evening run: ~20:00 (Europe/Istanbul)

### API Endpoints Test
- [ ] **GET /exec?action=getBackendInfo**: Returns JSON with version and schedule.
- [ ] **GET /exec?action=listVideos**: Returns JSON with video array.
- [ ] **GET /exec?action=listChannels**: Returns JSON with channel array.

---

## 3. Integration Testing

### End-to-End Test
- [ ] **Digest Page**: Loads videos correctly.
- [ ] **Video Details**: Opens details page, shows summaries.
- [ ] **Mark as Read**: Successfully updates status (check Sheet to confirm).
- [ ] **Channels**: Lists channels and filters correctly.
- [ ] **Activity Logs**: Shows recent run history.
- [ ] **Settings**: Backend info loads correctly.

### Error Handling
- [ ] **Network Error**: Disconnect internet and verify error message.
- [ ] **Backend Error**: Verify graceful handling if backend returns 500.

---

## 4. Hosting Deployment
### Docker (Local & Production)

#### Local Run
- [ ] **Configure Env**: Create `.env` with `BACKEND_BASE_URL` and `APP_ENV`.
- [ ] **Run**: `docker compose up --build`
- [ ] **Access**: Open `http://localhost:5173`

#### Dokploy Deployment
- [ ] **Project Type**: Select "Dockerfile".
- [ ] **Source**: Connect GitHub repository.
- [ ] **Environment Variables**:
  - `BACKEND_BASE_URL`: Your Apps Script URL.
  - `APP_ENV`: `production` (or `staging`).
- [ ] **Port**: Set exposed port to `80`.
- [ ] **Deploy**: Click "Deploy".
- [ ] **Verify**: Check logs for "Configuration generated" message.

### Vercel / Netlify (Legacy / Alternative)
- [ ] **Build Command**: `pnpm build`
- [ ] **Output Directory**: `dist`
- [ ] **Environment Variables**: Add `VITE_BACKEND_URL` to hosting platform settings.
- [ ] **Deploy**: Trigger deployment.
- [ ] **Verify URL**: Visit the live URL and confirm app loads.

---

## 5. Post-Deployment Verification

- [ ] **Mobile Test**: Open on mobile device (iOS/Android).
- [ ] **Install PWA**: Add to Home Screen and launch.
- [ ] **Offline Test**: Turn on Airplane mode and verify app shell loads.
- [ ] **Performance**: Check Lighthouse score (aim for >90 on Performance, Accessibility, Best Practices, SEO).

---

## 6. Troubleshooting

### Common Issues
- **CORS Error**: Check if Apps Script deployment is "Anyone" or "Anyone with Google Account".
- **404 Not Found**: Verify `VITE_BACKEND_URL` is correct and ends with `/exec`.
- **Empty Data**: Check if Google Sheet has data. Run `processSubscriptions` manually in Apps Script editor.
- **PWA Not Installing**: Check if served over HTTPS (required for Service Workers).

---

**Deployment Status:**
- [ ] Ready for Staging
- [ ] Ready for Production
