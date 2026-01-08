
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 确保代码中的 process.env.API_KEY 能在构建时被正确替换
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
  }
});
