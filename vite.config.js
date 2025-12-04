import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "BraCamp Bodybuilding",
        short_name: "BraCamp",
        description: "Gestión de pagos, rutinas y nutrición para BraCamp Bodybuilding",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        categories: ["fitness", "health", "lifestyle"],
        icons: [
          {
            src: "/logo6.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo6.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/logo6.png",
            sizes: "192x192 512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Mi Nutrición",
            short_name: "Nutrición",
            description: "Registrar comidas y ver macros",
            url: "/nutrition",
            icons: [{ src: "/logo6.png", sizes: "192x192" }],
          },
          {
            name: "Mi Rutina",
            short_name: "Rutina",
            description: "Ver mi rutina de entrenamiento",
            url: "/routine",
            icons: [{ src: "/logo6.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        // Cache de runtime para mejor performance
        runtimeCaching: [
          {
            // Cache de fuentes Google
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache de imágenes
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
            },
          },
          {
            // Cache de API de nutrición (alimentos, categorías) - datos que cambian poco
            urlPattern: /\/api\/nutrition\/(foods|categories|meal-types)/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "nutrition-static-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache de dashboard y logs - datos dinámicos (NetworkFirst)
            urlPattern: /\/api\/nutrition\/(dashboard|log|weekly)/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "nutrition-dynamic-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
});
