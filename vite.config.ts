import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/DexBuilder/', // Important: Use your repo name here
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Ensure assets are properly processed
    assetsDir: 'assets',
    // Ensure entry points are correctly handled
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  }
})