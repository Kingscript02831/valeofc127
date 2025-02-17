
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { supabase } from "./src/integrations/supabase/client";

// Fetch PWA configuration from Supabase
const getPWAConfig = async () => {
  const { data, error } = await supabase
    .from("site_configuration")
    .select("pwa_name, pwa_short_name, pwa_description, pwa_theme_color, pwa_background_color, pwa_app_icon")
    .single();

  if (error) {
    console.error("Error fetching PWA config:", error);
    return null;
  }

  return data;
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const pwaConfig = await getPWAConfig();

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: pwaConfig?.pwa_name || 'VALEOFC',
          short_name: pwaConfig?.pwa_short_name || 'VALEOFC',
          description: pwaConfig?.pwa_description || 'Seu app de notícias local',
          theme_color: pwaConfig?.pwa_theme_color || '#ffffff',
          background_color: pwaConfig?.pwa_background_color || '#ffffff',
          display: 'standalone',
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
        }
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
