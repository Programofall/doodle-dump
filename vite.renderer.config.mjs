// vite.config.js — renderer config
import { defineConfig } from 'vite';
import { createRequire } from 'node:module';

// Node's require for CJS packages — stays server‑side
const require = createRequire(import.meta.url);
const monacoEditorPlugin = require('vite-plugin-monaco-editor').default;

// https://vitejs.dev/config
export default defineConfig((env) => {
  const name = env.forgeConfig?.name ?? '';

  return {
    root: env.root,
    mode: env.mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      emptyOutDir: true,
      minify: env.mode === 'production' ? 'terser' : false,
      sourcemap: env.mode === 'development',
      assetsInlineLimit: 0, // Don't inline any assets
      rollupOptions: {
        input: 'index.html',
        external: [
          // Prevent these Node‑only deps from being bundled into renderer
          'electron-store'
        ]
      }
    },
    plugins: [
      pluginExposeRenderer(name),
      monacoEditorPlugin({})
    ],
    resolve: {
      preserveSymlinks: true
    },
    optimizeDeps: {
      // Vite won't try to prebundle CJS modules meant for Node
      exclude: ['electron-store']
    },
    clearScreen: false
  };
});

// Inline here to avoid cross‑file imports during Forge init
function pluginExposeRenderer(name) {
  return {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server) {
      process.viteDevServers ??= {};
      process.viteDevServers[name] = server;
      server.httpServer?.once('close', () => {
        delete process.viteDevServers[name];
      });
    }
  };
}