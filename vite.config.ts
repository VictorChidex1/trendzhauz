import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // firebase vendor chunk (~680 kB min) is a single, cache-stable SDK chunk
    // intentionally kept intact; per-page and other vendor chunks stay small.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules\/(react|react-dom|react-router|scheduler|use-sync-external-store)/,
            },
            {
              name: "firebase",
              test: /node_modules\/(firebase|@firebase)/,
            },
            {
              name: "tiptap",
              test: /node_modules\/@tiptap/,
            },
            {
              name: "motion",
              test: /node_modules\/(framer-motion|motion-dom|motion-utils)/,
            },
          ],
        },
      },
    },
  },
})
