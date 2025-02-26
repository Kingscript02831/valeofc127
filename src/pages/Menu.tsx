
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowLeft } from "lucide-react";

interface MenuItem {
  icon: string;
  label: string;
  path: string;
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

const Menu = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-accent/10 rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <main className="p-4">
        <h1 className="text-xl font-semibold text-foreground mb-6">Menu</h1>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-accent/10 transition-colors duration-200 group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-2 group-hover:bg-primary/20 transition-colors duration-200">
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

        <div className="border-t border-border pt-4 space-y-3">
          <a
            href={config?.navbar_social_facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/facebook.png" alt="Facebook" className="w-5 h-5 mr-3" />
            <span className="text-sm text-foreground">Facebook</span>
          </a>

          {config?.navbar_social_instagram && (
            <a
              href={config.navbar_social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
            >
              <img src="/instagram.png" alt="Instagram" className="w-5 h-5 mr-3" />
              <span className="text-sm text-foreground">Instagram</span>
            </a>
          )}

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img 
              src={theme === "light" ? "/modoescuro.png" : "/sun.png"} 
              alt="Alterar tema" 
              className="w-5 h-5 mr-3" 
            />
            <span className="text-sm text-foreground">
              {theme === "light" ? "Modo escuro" : "Modo claro"}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
          >
            <img src="/compartilhar.png" alt="Compartilhar" className="w-5 h-5 mr-3" />
            <span className="text-sm text-foreground">Compartilhar</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors duration-200"
          >
            <img src="/sair.png" alt="Sair" className="w-5 h-5 mr-3" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Menu;
