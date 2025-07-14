import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        popup: 'extension/popup.html',
        content: 'src/extension/content/index.ts',
        background: 'src/extension/background/index.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'popup') return 'popup.js';
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'background') return 'background.js';
          return '[name].[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'popup.css') return 'popup.css';
          if (assetInfo.name === 'content.css') return 'content.css';
          return '[name].[hash].[ext]';
        }
      }
    }
  }
}));
