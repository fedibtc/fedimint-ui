import { defineConfig, Plugin, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react() as PluginOption[], svgr() as Plugin],
  server: {
    open: true,
    port: 3000,
  },
  // "vite build" requires resolver to point to separate packages
  resolve: {
    alias: {
      '@fedimint/types': path.resolve(__dirname, '../../packages/types/src'),
      '@fedimint/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@fedimint/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
