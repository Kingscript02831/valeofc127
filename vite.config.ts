import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { createClient } from "@supabase/supabase-js";

// Criação do cliente Supabase
const supabase = createClient(
  "https://cxnktrfpqjjkdfmiyhdz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmt0cmZwcWpqa2RmbWl5aGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDAyNDksImV4cCI6MjA1NDgxNjI0OX0.GwEFcZ0mI8xuZs1hGJgz8R2zp13cLJIbtu6ZY2nDeTU"
);

// Função para buscar as configurações do PWA
const getPWAConfig = async () => {
  try {
    const { data, error } = await supabase
      .from("site_configuration")
      .select(
        "pwa_name, pwa_short_name, pwa_description, pwa_theme_color, pwa_background_color, pwa_app_icon"
      )
      .single();

    if (error) {
      console.error("Erro ao buscar configuração do PWA:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar PWAConfig:", error);
    return null;
  }
};

// Exportação da configuração
export default defineConfig(async () => {
  const pwaConfig = await getPWAConfig();

  // Configuração do manifesto do PWA
  const manifestConfig = {
    registerType: "autoUpdate",
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
    manifest: {
      name: pwaConfig?.pwa_name || "ValeOfc",
      short_name: pwaConfig?.pwa_short_name || "ValeOfc",
      description: pwaConfig?.pwa_description || "Seu app de notícias local",
      theme_color: pwaConfig?.pwa_theme_color || "#000000",
      background_color: pwaConfig?.pwa_background_color || "#ffffff",
      display: "standalone",
      icons: [
        {
          src: pwaConfig?.pwa_app_icon || "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: pwaConfig?.pwa_app_icon || "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: pwaConfig?.pwa_app_icon || "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: "module",
      navigateFallback: "index.html",
    },
  };

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      componentTagger(),
      VitePWA(manifestConfig),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
