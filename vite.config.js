import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Relative URLs keep the build working on GitHub Pages (/luxelumens_web/)
  // and on a custom domain alike.
  base: './',
  plugins: [react()],
  build: {
    // The Firebase SDK chunk (~690 kB) loads only in the admin panel.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        pl: page('./index.html'),
        en: page('./en/index.html'),
        admin: page('./admin/index.html'),
      },
    },
  },
});
