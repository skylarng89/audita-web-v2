import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// Vite config (ADR-8): plain Vue 3 SPA — no Nuxt. Tailwind CSS v4 is loaded
// CSS-first via the @tailwindcss/vite plugin; there is no tailwind.config.js.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 7000,
    proxy: {
      // Local dev proxies API + WS to the Go monolith; in production the
      // reverse proxy (caddy/nginx) or CDN handles this.
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/ws": { target: "ws://localhost:8080", ws: true },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts"],
  },
});
