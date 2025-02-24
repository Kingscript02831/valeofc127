
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Settings, HelpCircle, LogOut, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  icon: string;
  label: string;
  path: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: "newspaper",
    label: "Notícias",
    path: "/",
  },
  {
    icon: "calendar",
    label: "Eventos",
    path: "/eventos",
  },
  {
    icon: "shopping-bag",
    label: "Produtos",
    path: "/products",
  },
  {
    icon: "user",
    label: "Perfil",
    path: "/perfil",
  },
  {
    icon: "share2",
    label: "Compartilhar",
    path: "/share",
  },
  {
    icon: "plus-circle",
    label: "Criar",
    path: "/criar",
  },
  {
    icon: "bell",
    label: "Notificações",
    path: "/notify",
  },
  {
    icon: "play-circle",
    label: "Reels",
    path: "/reels",
  },
  {
    icon: "message-square",
    label: "Posts",
    path: "/posts",
  },
];

export const MenuConfig = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
    <div className="fixed top-0 right-0 bottom-0 z-50">
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
      >
        {isMenuOpen ? (
          <ChevronRight className="w-6 h-6 transform transition-transform duration-300" />
        ) : (
          <Menu className="w-6 h-6 transform transition-transform duration-300" />
        )}
      </button>

      <div
        className={`fixed top-0 right-0 bottom-0 w-72 bg-background/95 backdrop-blur-sm shadow-lg transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <h1 className="text-xl font-semibold mb-6">Menu</h1>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={toggleMenu}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-accent transition-colors duration-200"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                  <img
                    src={`/${item.icon}.png`}
                    alt={item.label}
                    className="w-6 h-6 object-contain opacity-80"
                  />
                </div>
                <span className="text-xs font-medium text-center">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-border pt-4 space-y-2">
            <Link
              to="/config"
              onClick={toggleMenu}
              className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors duration-200"
            >
              <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="text-sm">Configurações</span>
            </Link>
            
            <Link
              to="/ajuda"
              onClick={toggleMenu}
              className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors duration-200"
            >
              <HelpCircle className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="text-sm">Ajuda e suporte</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center p-3 w-full hover:bg-accent rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3 text-muted-foreground" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuConfig;
