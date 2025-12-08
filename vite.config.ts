import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  define: {
    '__BUILD_SHA__': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'dev'),
    '__GIT_SHA__': JSON.stringify(process.env.VITE_GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'dev'), // Keep for backward compatibility
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Immediate update
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'TubeDigest',
        short_name: 'TubeDigest',
        description: 'Your daily YouTube video summaries powered by AI',
        theme_color: '#135bec',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // NetworkOnly for Backend API - NEVER cache API responses
            // This ensures fresh data on every request
            urlPattern: /^https:\/\/script\.google\.com\/macros\/.*/i,
            handler: 'NetworkOnly',
            options: {
              // Explicitly disable caching
              cacheableResponse: {
                statuses: [] // Don't cache any responses
              },
              // Background sync for offline retries only
              backgroundSync: {
                name: 'apiQueue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for max 24 hours
                }
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
