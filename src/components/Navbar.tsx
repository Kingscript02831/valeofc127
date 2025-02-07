
import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Navbar = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    const { data } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (data) {
      setConfig(data);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Vale Notícias",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (!config) return null;

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark border-b border-primary/20 shadow-xl"
         style={{ 
           background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
           borderColor: `${config.primary_color}20`
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-8"
              />
            ) : (
              <span 
                className="text-2xl font-bold tracking-tighter px-4 py-1 rounded-lg"
                style={{ 
                  color: config.text_color,
                  backgroundColor: `${config.accent_color}20`
                }}
              >
                {config.navbar_logo_text || 'VALEOFC'}
              </span>
            )}
          </a>

          <div className="flex items-center space-x-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-accent/20"
              style={{ 
                color: `${config.text_color}90`,
              }}
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" strokeWidth={2.5} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-accent/20"
              style={{ 
                color: `${config.text_color}90`,
              }}
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" strokeWidth={2.5} />
            </a>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="transition-all duration-300 ease-out hover:scale-110 rounded-full p-2 hover:bg-accent/20"
              style={{ 
                color: `${config.text_color}90`,
              }}
              aria-label="Compartilhar"
            >
              <Share2 className="h-6 w-6" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
