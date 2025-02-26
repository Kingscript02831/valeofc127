
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useTheme } from "./ThemeProvider";
import { ArrowLeft, Menu, X } from "lucide-react";

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

interface MenuConfigProps {
  onClose?: () => void;
}

export const menuItems: MenuItem[] = [
  {
    icon: "noticias",
    label: "Notícias",
    path: "/noticias",
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
    path: "/",
  },
];

const MenuConfig = ({ onClose }: MenuConfigProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
  const { theme, setTheme } = useTheme();

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

  const handleLinkClick = (path: string) => {
    if (onClose) onClose();
    navigate(path);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-96 transform transition-transform duration-300 bg-background dark:bg-background shadow-lg border-l border-border">
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-accent/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-foreground">Menu</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent/10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className="flex flex-col items-center p-4 rounded-xl hover:bg-accent/10 transition-colors duration-200 group"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors duration-200">
                <img
                  src={`/${item.icon}.png`}
                  alt={item.label}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-sm font-medium text-center text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-border pt-6 space-y-3">
          <a
            href={config?.navbar_social_facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/facebook.png" alt="Facebook" className="w-6 h-6 mr-3" />
            <span className="text-sm text-foreground">Facebook</span>
          </a>

          {config?.navbar_social_instagram && (
            <a
              href={config.navbar_social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
            >
              <img src="/instagram.png" alt="Instagram" className="w-6 h-6 mr-3" />
              <span className="text-sm text-foreground">Instagram</span>
            </a>
          )}

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img 
              src="/modoescuro.png"
              alt="Alterar tema" 
              className="w-6 h-6 mr-3" 
            />
            <span className="text-sm text-foreground">
              {theme === "light" ? "Modo escuro" : "Modo claro"}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/compartilhar.png" alt="Compartilhar" className="w-6 h-6 mr-3" />
            <span className="text-sm text-foreground">Compartilhar</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors duration-200"
          >
            <img src="/sair.png" alt="Sair" className="w-6 h-6 mr-3" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuConfig;
