
import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "../components/ui/button";
import { useSiteConfig } from "../hooks/useSiteConfig";

const Navbar = () => {
  const { data: config, isLoading, isError } = useSiteConfig();

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

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide items-center h-16 gap-x-4">
            <span className="text-white whitespace-nowrap">Vale Notícias</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full fixed top-0 z-50 shadow-md fade-in"
         style={{ 
           background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
           borderColor: `${config?.primary_color}20`
         }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide justify-between items-center h-16 gap-x-4">
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105 whitespace-nowrap"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
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
                className="text-3xl font-bold tracking-tighter px-6 py-3 rounded-full whitespace-nowrap"
                style={{ 
                  color: config.text_color,
                  backgroundColor: `${config.primary_color}20`
                }}
              >
                {config.navbar_logo_text || 'VALEOFC'}
              </span>
            )}
          </a>

          <div className="flex items-center space-x-3 whitespace-nowrap">
            {config.navbar_social_facebook && (
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

            {config.navbar_social_instagram && (
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
                color: config.text_color,
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
