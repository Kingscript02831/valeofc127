
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Share2, Facebook, Instagram } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "../hooks/useSiteConfig";

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: "noticias",
    label: "Notícias",
    path: "/",
  },
  {
    icon: "eventos.png",
    label: "Eventos",
    path: "/eventos",
  },
  {
    icon: "produtos",
    label: "Produtos",
    path: "/products",
  },
  {
    icon: "perfil",
    label: "Perfil",
    path: "/perfil",
  },
  {
    icon: "notificacoes",
    label: "Notificações",
    path: "/notify",
  },
  {
    icon: "reels",
    label: "Reels",
    path: "/reels",
  },
  {
    icon: "posts",
    label: "Posts",
    path: "/posts",
  },
];

const MenuConfig = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { data: config } = useSiteConfig();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Não foi possível desconectar sua conta",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="transition-all duration-300 ease-out hover:scale-110 p-2.5 rounded-xl hover:shadow-lg"
        style={{ 
          color: config?.text_color,
          background: config ? `${config.primary_color}10` : 'transparent',
        }}
      >
        <img src="/menu-bars.png" alt="Menu" className="h-5 w-5" />
      </button>

      <div
        className={`fixed top-0 right-0 bottom-0 w-72 shadow-lg transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ 
          background: config ? `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})` : 'background',
          color: config?.text_color
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold" style={{ color: config?.text_color }}>Menu</h1>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
              <img src="/close.png" alt="Fechar" className="h-5 w-5" style={{ filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={toggleMenu}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-white/10 transition-colors duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-2">
                  <img
                    src={`/${item.icon}.png`}
                    alt={item.label}
                    className="w-6 h-6 object-contain"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <span className="text-xs font-medium text-center">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-white/20 pt-4 space-y-2">
            {config?.navbar_social_facebook && (
              <a
                href={config.navbar_social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <Facebook className="w-5 h-5 mr-3" />
                <span className="text-sm">Facebook</span>
              </a>
            )}

            {config?.navbar_social_instagram && (
              <a
                href={config.navbar_social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <Instagram className="w-5 h-5 mr-3" />
                <span className="text-sm">Instagram</span>
              </a>
            )}

            <button
              onClick={handleShare}
              className="flex items-center p-3 w-full hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <img
                src="/compartilhar.png"
                alt="Compartilhar"
                className="w-5 h-5 mr-3"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-sm">Compartilhar</span>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center p-3 w-full hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <img
                src={theme === 'dark' ? '/sun.png' : '/moon.png'}
                alt={theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
                className="w-5 h-5 mr-3"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-sm">
                {theme === 'dark' ? "Modo Claro" : "Modo Escuro"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center p-3 w-full hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <img
                src="/sair.png"
                alt="Sair"
                className="w-5 h-5 mr-3"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuConfig;

