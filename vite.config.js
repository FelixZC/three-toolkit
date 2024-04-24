import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['three'],
  },
});