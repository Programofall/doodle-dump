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
        // Removed '@google/generative-ai' to allow bundling
      ],
    },
    // Add chunk size warning limit to handle large bundle warnings
    chunkSizeWarningLimit: 1000,
  },
  // Ensure Node.js modules are available in the main process
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
