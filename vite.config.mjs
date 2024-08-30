import {
  defineConfig
} from 'vite';
import path from 'path';

import glsl from "vite-plugin-glsl";
export default defineConfig({
  // 项目根目录
  root: process.cwd(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 定义 @ 指向 src 目录
      '@src': path.resolve(__dirname, './src') // 定义 @ 指向 src 目录
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    outDir: './dist', // 输出目录
    emptyOutDir: true, // 是否清空输出目录
    sourcemap: true, // 是否生成 source map
  },
  optimizeDeps: {
    include: ['three'],
  },
  plugins: [glsl()],
});
