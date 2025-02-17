import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Erro ao carregar a imagem do logo:", e);
    toast.error("Erro ao carregar o logo. Verifique se o link do Dropbox termina com '?raw=1'");
  };

  const formatDropboxUrl = (url: string) => {
    if (!url) return url;
    return url.replace(/\?dl=\d/, "?raw=1");
  };

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200 backdrop-blur-lg" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800 backdrop-blur-lg">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide items-center h-16 gap-x-4">
            <span className="text-white whitespace-nowrap">Vale Notícias</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full fixed top-0 z-50 shadow-lg transition-all duration-300 backdrop-blur-md border-b"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}99, ${config.primary_color}99)`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide justify-between items-center h-16 gap-x-4">
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105 whitespace-nowrap group"
          >
            {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
              <img 
                src={formatDropboxUrl(config.navbar_logo_image)}
                alt="Logo" 
                className="h-12 w-12 rounded-xl object-cover border-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                style={{ 
                  borderColor: config.text_color,
                }}
                onError={handleImageError}
              />
            ) : (
              <span 
                className="text-3xl font-bold tracking-tight px-6 py-2 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg whitespace-nowrap"
                style={{ 
                  color: config.text_color,
                  backgroundColor: `${config.primary_color}15`,
                  textShadow: `0 2px 4px ${config.primary_color}20`
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
                className="transition-all duration-300 ease-out hover:scale-110 p-2.5 rounded-xl hover:shadow-lg"
                style={{ 
                  color: config.text_color,
                  background: `${config.primary_color}10`,
                }}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={2} />
              </a>
            )}

            {config.navbar_social_instagram && (
              <a
                href={config.navbar_social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2.5 rounded-xl hover:shadow-lg"
                style={{ 
                  color: config.text_color,
                  background: `${config.primary_color}10`,
                }}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={2} />
              </a>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="transition-all duration-300 ease-out hover:scale-110 rounded-xl p-2.5 hover:shadow-lg"
              style={{ 
                color: config.text_color,
                background: `${config.primary_color}10`,
              }}
              aria-label="Compartilhar"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
