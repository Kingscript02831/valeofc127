import { Share2, Facebook, Instagram, User, Menu, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

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
    return <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />;
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
    <nav
      className="w-full fixed top-0 z-50 shadow-md fade-in backdrop-blur-md"
      style={{
        background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
        borderBottom: `2px solid ${config?.primary_color}50`,
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 transform transition duration-300 hover:scale-105">
            {config.navbar_logo_type === "image" && config.navbar_logo_image ? (
              <img
                src={formatDropboxUrl(config.navbar_logo_image)}
                alt="Logo"
                className="h-14 w-14 rounded-full object-cover border-2 shadow-md transition-transform duration-300 hover:scale-110"
                style={{ borderColor: config.text_color }}
                onError={handleImageError}
              />
            ) : (
              <span
                className="text-4xl font-extrabold tracking-tight px-6 py-3 rounded-full whitespace-nowrap shadow-md"
                style={{
                  color: config.text_color,
                  backgroundColor: `${config.primary_color}30`,
                }}
              >
                {config.navbar_logo_text || "VALEOFC"}
              </span>
            )}
          </a>

          <div className="flex items-center space-x-6">
            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-all duration-300 ease-out hover:scale-125 rounded-full p-3 hover:bg-opacity-20"
                  style={{ color: config.text_color }}
                  aria-label="Menu"
                >
                  <Menu className="h-10 w-10" strokeWidth={2.8} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-[220px] rounded-xl shadow-lg overflow-hidden border"
                align="end"
                style={{
                  background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
                  color: config.text_color,
                  borderColor: `${config?.primary_color}50`,
                }}
              >
                <DropdownMenuItem
                  onClick={handleShare}
                  className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-30 rounded-md transition-all"
                  style={{ color: config.text_color }}
                >
                  <Share2 className="h-5 w-5" strokeWidth={2} />
                  <span className="text-lg">Compartilhar</span>
                </DropdownMenuItem>

                {config.navbar_social_facebook && (
                  <DropdownMenuItem asChild className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-30 rounded-md">
                    <a href={config.navbar_social_facebook} target="_blank" rel="noopener noreferrer" className="w-full" style={{ color: config.text_color }}>
                      <Facebook className="h-5 w-5" strokeWidth={2} />
                      <span className="text-lg">Facebook</span>
                    </a>
                  </DropdownMenuItem>
                )}

                {config.navbar_social_instagram && (
                  <DropdownMenuItem asChild className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-30 rounded-md">
                    <a href={config.navbar_social_instagram} target="_blank" rel="noopener noreferrer" className="w-full" style={{ color: config.text_color }}>
                      <Instagram className="h-5 w-5" strokeWidth={2} />
                      <span className="text-lg">Instagram</span>
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-30 rounded-md">
                  <a href="/perfil" className="w-full" style={{ color: config.text_color }}>
                    <User className="h-5 w-5" strokeWidth={2} />
                    <span className="text-lg">Perfil</span>
                  </a>
                </DropdownMenuItem>

                {/* Botão de modo escuro dentro do menu */}
                <DropdownMenuItem className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-opacity-30 rounded-md">
                  <Moon className="h-5 w-5" strokeWidth={2} />
                  <ThemeToggle />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
