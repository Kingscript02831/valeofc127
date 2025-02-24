
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Share2, Instagram } from "lucide-react";
import { Button } from "./ui/button";

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
    icon: "eventos",
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
  const { data: config } = useSiteConfig();
  const { theme, setTheme } = useTheme();

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
        } bg-background dark:bg-background border-l border-border`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-foreground">Menu</h1>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-accent transition-colors duration-200"
            >
              <img src="/close.png" alt="Fechar" className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={toggleMenu}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-accent transition-colors duration-200 group"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-2 group-hover:bg-primary/20">
                  <img
                    src={`/${item.icon}.png`}
                    alt={item.label}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-center text-foreground">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-border pt-4 space-y-3">
            {config?.navbar_social_instagram && (
              <a
                href={config.navbar_social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors duration-200"
              >
                <Instagram className="w-5 h-5 mr-3" />
                <span className="text-sm text-foreground">Instagram</span>
              </a>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-3 font-normal"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-3" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="text-sm text-foreground">
                {theme === "light" ? "Modo escuro" : "Modo claro"}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-3 font-normal"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-3" />
              <span className="text-sm text-foreground">Compartilhar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start p-3 font-normal hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <img
                src="/sair.png"
                alt="Sair"
                className="w-5 h-5 mr-3"
              />
              <span className="text-sm">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuConfig;
