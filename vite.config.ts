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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  optimizeDeps: {
    exclude: ["pdf-lib"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Use ESM build of pako to avoid default export issues
      "pako": path.resolve(__dirname, "./src/libs/pako-shim.ts"),
    },
  },
}));
