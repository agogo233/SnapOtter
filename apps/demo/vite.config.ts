import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../web/src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: true,
    port: 1352,
  },
  build: {
    outDir: "dist",
  },
});
