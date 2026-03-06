import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process
        entry: path.resolve(__dirname, 'electron/main/index.ts'),
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron/main'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        // Preload script
        entry: path.resolve(__dirname, 'electron/preload/index.ts'),
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete
          options.reload();
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, 'dist-electron/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './gui'),
      '@core': path.resolve(__dirname, './core'),
    },
  },
  root: path.resolve(__dirname, 'gui'),
  build: {
    outDir: path.resolve(__dirname, 'dist-electron/renderer'),
    emptyOutDir: true,
  },
});
