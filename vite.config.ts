import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Clear cache on start
    force: true
  },
  build: {
    // Clean output directory before build
    emptyOutDir: true,
    // Improve caching
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  optimizeDeps: {
    // Force dependency pre-bundling
    force: true,
    exclude: ['lucide-react']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});