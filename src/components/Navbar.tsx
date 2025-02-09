
import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Navbar = () => {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    placeholderData: {
      navbar_color: '#D6BCFA',
      primary_color: '#1A1F2C',
      text_color: '#FFFFFF',
      navbar_logo_type: 'text',
      navbar_logo_text: 'VALEOFC',
      navbar_social_facebook: '',
      navbar_social_instagram: '',
    } as SiteConfig,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

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

  return (
    <nav className="w-full"
         style={{ 
           background: `linear-gradient(to right, ${config?.navbar_color || '#D6BCFA'}, ${config?.primary_color || '#1A1F2C'})`,
           borderColor: `${config?.primary_color || '#1A1F2C'}20`
         }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
          >
            {config?.navbar_logo_type === 'image' && config?.navbar_logo_image ? (
              <img 
                src={config.navbar_logo_image} 
                alt="Logo" 
                className="h-12 w-12 rounded-full object-cover border-2 transition-transform duration-300 hover:scale-110"
                style={{ 
                  borderColor: config.text_color,
                }}
              />
            ) : (
              <span 
                className="text-3xl font-bold tracking-tighter px-6 py-3 rounded-full"
                style={{ 
                  color: config?.text_color || '#FFFFFF',
                  backgroundColor: `${config?.primary_color || '#1A1F2C'}20`
                }}
              >
                {config?.navbar_logo_text || 'VALEOFC'}
              </span>
            )}
          </a>

          <div className="flex items-center space-x-3">
            {config?.navbar_social_facebook && (
              <a
                href={config.navbar_social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ 
                  color: config.text_color,
                }}
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" strokeWidth={2.5} />
              </a>
            )}

            {config?.navbar_social_instagram && (
              <a
                href={config.navbar_social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ 
                  color: config.text_color,
                }}
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" strokeWidth={2.5} />
              </a>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="transition-all duration-300 ease-out hover:scale-110 rounded-full p-2 hover:bg-primary/20"
              style={{ 
                color: config?.text_color || '#FFFFFF',
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
