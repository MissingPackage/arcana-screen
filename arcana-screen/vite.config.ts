import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split heavy vendors off the app chunk: keeps each file well under the per-file
        // asset budget and lets browsers cache rarely-changing dependencies separately.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@phosphor-icons')) return 'icons';
          if (id.includes('react-dnd') || id.includes('dnd-core')) return 'dnd';
          if (id.includes('react') || id.includes('scheduler')) return 'react';
          return 'vendor';
        },
      },
    },
  },
})
