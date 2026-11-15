import { defineConfig } from "vite";

export default defineConfig({
  // The Python data pipeline writes generated JSON to frontend/data.
  // Exposing that directory as Vite's public directory keeps one data source
  // for both the static server and the Vite dev/build workflows.
  publicDir: "frontend/data",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
