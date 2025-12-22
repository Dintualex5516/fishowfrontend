// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'FishowERP',
        name: 'Fishow ERP Application',
        icons: [
          {
            src: 'assets/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        orientation: 'portrait'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
