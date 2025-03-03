
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { RefreshCw, Database } from 'lucide-react';

// Este componente permite aos usuários limpar e atualizar o cache manualmente
const PWACacheManager = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheStats, setCacheStats] = useState<{size: string, items: number} | null>(null);

  // Função para obter estatísticas do cache
  const getCacheStats = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        let totalSize = 0;
        let totalItems = 0;
        
        for (const name of cacheNames) {
          const cache = await window.caches.open(name);
          const requests = await cache.keys();
          totalItems += requests.length;
          
          // Estimar tamanho (limitado devido a restrições de API)
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.clone().blob();
              totalSize += blob.size;
            }
          }
        }
        
        // Converter para KB ou MB
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        setCacheStats({
          size: `${sizeInMB} MB`,
          items: totalItems
        });
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas do cache:', error);
    }
  };

  // Função para atualizar o cache e o conteúdo do app
  const refreshCache = async () => {
    setIsRefreshing(true);
    try {
      // Verifica se o service worker está registrado
      if ('serviceWorker' in navigator) {
        // Obtém todos os service workers registrados
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        // Para cada service worker, envia mensagem para limpar o cache
        const clearPromises = registrations.map(registration => {
          if (registration.active) {
            return registration.active.postMessage({ type: 'CLEAR_CACHE' });
          }
          return Promise.resolve();
        });
        
        // Espera todas as operações de limpeza
        await Promise.all(clearPromises);
        
        // Limpar todos os caches manualmente (fallback)
        if ('caches' in window) {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => window.caches.delete(cacheName))
          );
        }
        
        // Atualiza a página para obter conteúdo fresco
        window.location.reload();
        toast.success('Cache limpo e conteúdo atualizado!');
      } else {
        toast.error('Service Worker não suportado neste navegador');
      }
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
      toast.error('Falha ao atualizar o cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Verifica se o app está rodando em modo PWA instalado
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    // Detecta se o app está sendo executado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsPWA(isStandalone);
    
    // Obter estatísticas iniciais do cache
    if (isStandalone) {
      getCacheStats();
    }
    
    // Verificar periodicamente o tamanho do cache (a cada 5 minutos)
    const interval = setInterval(() => {
      if (isStandalone) {
        getCacheStats();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Só mostra o botão se estiver no modo PWA
  if (!isPWA) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={refreshCache}
        disabled={isRefreshing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Atualizando...' : 'Atualizar conteúdo'}
      </Button>
      
      {cacheStats && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>Cache: {cacheStats.size} ({cacheStats.items} itens)</span>
        </div>
      )}
    </div>
  );
};

export default PWACacheManager;
