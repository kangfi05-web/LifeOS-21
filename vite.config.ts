import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tailwind-merge', 'clsx', 'date-fns', 'zustand', 'framer-motion', 'recharts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-motion': ['framer-motion'],
          'vendor-db': ['dexie'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'uuid', 'zustand'],
        },
      },
    },
  },
});
