
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowLeft } from "lucide-react";

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
      const baseUrl = window.location.origin;
      await navigator.share({
        title: "Vale Notícias",
        url: `${baseUrl}/`,
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
    <div className="min-h-screen w-full bg-background overflow-y-auto">
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-accent/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold text-foreground">Menu</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleLinkClick(item.path)}
              className="flex flex-col items-center p-6 rounded-xl hover:bg-accent/10 transition-colors duration-200 group"
            >
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                <img
                  src={`/${item.icon}.png`}
                  alt={item.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-base font-medium text-center text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <a
            href={config?.navbar_social_facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/facebook.png" alt="Facebook" className="w-7 h-7 mr-4" />
            <span className="text-base text-foreground">Facebook</span>
          </a>

          {config?.navbar_social_instagram && (
            <a
              href={config.navbar_social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 hover:bg-accent/10 rounded-lg transition-colors duration-200"
            >
              <img src="/instagram.png" alt="Instagram" className="w-7 h-7 mr-4" />
              <span className="text-base text-foreground">Instagram</span>
            </a>
          )}

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full flex items-center p-4 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img 
              src="/modoescuro.png"
              alt="Alterar tema" 
              className="w-7 h-7 mr-4" 
            />
            <span className="text-base text-foreground">
              {theme === "light" ? "Modo escuro" : "Modo claro"}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center p-4 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/compartilharlink.png" alt="Compartilhar" className="w-7 h-7 mr-4" />
            <span className="text-base text-foreground">Compartilhar</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start p-4 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors duration-200"
          >
            <img src="/sair.png" alt="Sair" className="w-7 h-7 mr-4" />
            <span className="text-base">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuConfig;
