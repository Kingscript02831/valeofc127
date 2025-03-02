
// Definição das estratégias de cache para diferentes tipos de recursos
export const pwaCache = {
  // Estratégia para imagens e ícones - cache primeiro, depois rede (para atualizações)
  images: {
    name: 'images-cache',
    pattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
    strategy: 'CacheFirst',
    maxEntries: 50,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
  },
  
  // Estratégia para vídeos - cache primeiro, mas com validade menor
  videos: {
    name: 'videos-cache',
    pattern: /\.(mp4|webm|ogg)$/,
    strategy: 'CacheFirst',
    maxEntries: 20,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
  },
  
  // Estratégia para fontes - cache longo prazo
  fonts: {
    name: 'fonts-cache',
    pattern: /\.(woff|woff2|ttf|otf|eot)$/,
    strategy: 'CacheFirst',
    maxEntries: 10,
    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
  },

  // Estratégia para os assets do aplicativo - inclui os ícones do Lucide também
  assets: {
    name: 'assets-cache',
    pattern: /\/assets\//,
    strategy: 'CacheFirst',
    maxEntries: 100, 
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
  }
};

// URLs específicas para pré-cache (serão armazenadas durante a instalação do service worker)
export const precacheUrls = [
  // Adicione URLs específicas de mídias importantes para carregar offline
  '/curtidas.png',
  '/comentario.png',
  '/compartilharlink.png',
  '/whatsapp.png',
  '/placeholder.svg',
  // Outros recursos importantes que devem estar disponíveis offline
];
