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
      '@': path.resolve(__dirname, './src') // 定义 @ 指向 src 目录
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
    outDir: './dist', // 输出目录
    emptyOutDir: true, // 是否清空输出目录
    sourcemap: true, // 是否生成 source map
  },
  optimizeDeps: {
    include: ['three'],
  },
  plugins: [glsl()],
});