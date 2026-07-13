// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: "/src/vue-setup.ts",
    }),

    // Astro PWA Configuration
    AstroPWA({
      registerType: "autoUpdate",
      injectRegister: "inline",
      manifest: {
        name: "Geography Games Hub",
        short_name: "GeoHub",
        description: "Master the world map. Play offline. Zero ads.",
        theme_color: "#06acf9",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,svg,png,json,topo.json,ico}"],
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
