import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Phaser's SVG loader is more reliable with real asset URLs than with
    // Vite-inlined data: URIs, especially on Firefox and lower-memory devices.
    assetsInlineLimit: 0,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
