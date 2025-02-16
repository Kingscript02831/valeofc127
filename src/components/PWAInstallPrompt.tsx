
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <X size={20} />
      </button>
      <h3 className="text-lg font-semibold mb-2">Instale nosso aplicativo!</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Instale o VALEOFC para ter uma experiência melhor e acesso rápido a todas as novidades.
      </p>
      <div className="flex justify-end">
        <Button onClick={handleInstall}>
          Instalar Agora
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
