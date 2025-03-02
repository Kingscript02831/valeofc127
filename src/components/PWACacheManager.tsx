
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

// Este componente permite aos usuários limpar e atualizar o cache manualmente
const PWACacheManager = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  }, []);

  // Só mostra o botão se estiver no modo PWA
  if (!isPWA) return null;

  return (
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
  );
};

export default PWACacheManager;
