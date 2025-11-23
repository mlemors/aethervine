import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@core': path.resolve(__dirname, './src/core'),
      '@data': path.resolve(__dirname, './src/data'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      // Redirect old sqlite_loader to new web version
      './sqlite_loader': path.resolve(__dirname, './src/data/sqlite_loader_web'),
    },
  },
  optimizeDeps: {
    exclude: ['sql.js', 'better-sqlite3'],
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      strict: false, // Allow serving files from parent directories
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['better-sqlite3'],
    },
  },
})
