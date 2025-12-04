import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // Base path: '/' for all environments (Vercel doesn't need subdirectory)
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
}));
