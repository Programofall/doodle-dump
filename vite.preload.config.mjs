import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'electron',
        'electron-store', // Add electron-store as external
        'path',
        'fs',
        'os',
        'crypto'
      ],
    },
  },
});
