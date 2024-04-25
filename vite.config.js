import { defineConfig } from 'vite';
import commonjs from 'rollup-plugin-commonjs';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['three', 'three/examples/jsm/controls/OrbitControls'],
  },
  plugins: [
    commonjs(), // 添加 CommonJS 插件
  ],
});