/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

const rootDir = import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Pet Studio — Clínica, Banho & Tosa e Hotel',
        short_name: 'Pet Studio',
        description: 'Clínica veterinária, banho e tosa, hotel e loja para seu pet.',
        theme_color: '#f0b21d',
        background_color: '#faf7f0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?source=pwa',
        lang: 'pt-BR',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Agendar banho', url: '/banho-e-tosa' },
          { name: 'Loja', url: '/loja' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/admin/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 80, maxAgeSeconds: 2592000 },
            },
          },
          {
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: 'hidden',
    // NOTE: no manual vendor chunking here on purpose. Vite 8 builds with Rolldown, which only
    // partially honours the legacy `output.manualChunks` — assigning React to a "vendor-react"
    // group still left React core inside the react-day-picker chunk, which in turn dragged the
    // calendar's render-blocking stylesheet onto the Home page. Rolldown's own chunking gets this
    // right, and the split that actually matters (per-route, admin isolated from the public
    // bundle) comes from lazy() in app/router.tsx, not from vendor grouping.
    // See IMPLEMENTATION_PLAN.md §9.3a.
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
