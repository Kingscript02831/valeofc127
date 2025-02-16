
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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-12 px-4"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        color: config.text_color
      }}
    >
      <div className="flex items-center gap-3">
        <Download size={18} style={{ color: config.text_color }} />
        <p className="text-sm" style={{ color: config.text_color }}>
          {config.pwa_install_message || "Instale nosso aplicativo para uma experiência melhor!"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleInstall}
          className="text-sm h-8"
          style={{
            backgroundColor: config.button_secondary_color,
            color: config.text_color
          }}
        >
          Instalar
        </Button>
        <button
          onClick={() => setShowPrompt(false)}
          className="hover:opacity-80 transition-opacity"
          style={{ color: config.text_color }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
