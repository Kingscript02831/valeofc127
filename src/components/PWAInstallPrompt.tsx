
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
import { useSiteConfig } from '../hooks/useSiteConfig';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { data: config } = useSiteConfig();

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

  if (!showPrompt || !config) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
      style={{ backgroundColor: config.navbar_color }}
    >
      <div className="flex items-center gap-3">
        <Download size={20} className="text-white" />
        <p className="text-white text-sm">
          {config.pwa_install_message || "Instale nosso aplicativo para uma experiência melhor!"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleInstall}
          className="text-sm"
        >
          Instalar
        </Button>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-white hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
