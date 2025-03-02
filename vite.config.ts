
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { createClient } from '@supabase/supabase-js';
import { pwaCache, precacheUrls } from "./src/pwa-cache-config";

const supabase = createClient(
  "https://cxnktrfpqjjkdfmiyhdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmt0cmZwcWpqa2RmbWl5aGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDAyNDksImV4cCI6MjA1NDgxNjI0OX0.GwEFcZ0mI8xuZs1hGJgz8R2zp13cLJIbtu6ZY2nDeTU"
);

// Fetch PWA configuration from Supabase
const getPWAConfig = async () => {
  try {
    const { data, error } = await supabase
      .from("site_configuration")
      .select("pwa_name, pwa_short_name, pwa_description, pwa_theme_color, pwa_background_color, pwa_app_icon")
      .single();

    if (error) {
      console.error("Error fetching PWA config:", error);
      return null;
    }

    console.log("Fetched PWA config:", data);
    return data;
  } catch (error) {
    console.error("Error in getPWAConfig:", error);
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const pwaConfig = await getPWAConfig();
  console.log("Final PWA Config being used:", pwaConfig);

  if (!pwaConfig?.pwa_app_icon) {
    console.warn("Warning: No PWA icon configured in site_configuration!");
  } else {
    console.log("Using PWA icon:", pwaConfig.pwa_app_icon);
  }

  const manifestConfig = {
    registerType: "autoUpdate" as const,
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: pwaConfig?.pwa_name || 'ValeOfc',
      short_name: pwaConfig?.pwa_short_name || 'ValeOfc',
      description: pwaConfig?.pwa_description || 'Seu app de notícias local',
      theme_color: pwaConfig?.pwa_theme_color || '#000000',
      background_color: pwaConfig?.pwa_background_color || '#ffffff',
      display: 'standalone' as const,
      icons: [
        {
          src: pwaConfig?.pwa_app_icon || '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: pwaConfig?.pwa_app_icon || '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: pwaConfig?.pwa_app_icon || '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      // Configuração do Workbox para cache
      runtimeCaching: [
        {
          urlPattern: pwaCache.images.pattern,
          handler: pwaCache.images.strategy as any,
          options: {
            cacheName: pwaCache.images.name,
            expiration: {
              maxEntries: pwaCache.images.maxEntries,
              maxAgeSeconds: pwaCache.images.maxAgeSeconds
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: pwaCache.videos.pattern,
          handler: pwaCache.videos.strategy as any,
          options: {
            cacheName: pwaCache.videos.name,
            expiration: {
              maxEntries: pwaCache.videos.maxEntries,
              maxAgeSeconds: pwaCache.videos.maxAgeSeconds
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: pwaCache.fonts.pattern,
          handler: pwaCache.fonts.strategy as any,
          options: {
            cacheName: pwaCache.fonts.name,
            expiration: {
              maxEntries: pwaCache.fonts.maxEntries,
              maxAgeSeconds: pwaCache.fonts.maxAgeSeconds
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: pwaCache.assets.pattern,
          handler: pwaCache.assets.strategy as any,
          options: {
            cacheName: pwaCache.assets.name,
            expiration: {
              maxEntries: pwaCache.assets.maxEntries,
              maxAgeSeconds: pwaCache.assets.maxAgeSeconds
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        // Cache para requisições da API Supabase (com revalidação na rede)
        {
          urlPattern: /^https:\/\/cxnktrfpqjjkdfmiyhdz\.supabase\.co\/.*/i,
          handler: 'NetworkFirst' as any,
          options: {
            cacheName: 'supabase-api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 // 1 hora
            },
            cacheableResponse: {
              statuses: [0, 200]
            },
            networkTimeoutSeconds: 10
          }
        }
      ],
      // Precache de recursos específicos
      globPatterns: ['**/*.{js,css,html}'],
      skipWaiting: true,
      clientsClaim: true,
      // Adiciona URLs específicas para pré-cache
      additionalManifestEntries: precacheUrls.map(url => ({
        url,
        revision: null
      }))
    },
    devOptions: {
      enabled: true,
      type: 'module',
      navigateFallback: 'index.html'
    }
  };

  console.log("PWA Manifest configuration:", manifestConfig);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
      VitePWA(manifestConfig)
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
