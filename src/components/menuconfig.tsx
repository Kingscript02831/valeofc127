import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { useTheme } from "../components/ThemeProvider";
import { useSiteConfig } from "../hooks/useSiteConfig";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface NavLink {
  label: string;
  href: string;
}

const MenuConfig = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();
  const { theme, setTheme } = useTheme();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
        toast({
          title: "Compartilhado!",
          description: "O link foi compartilhado com sucesso.",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao compartilhar",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Desconectado!",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/login");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(true)}
        className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-105"
        style={{ 
          color: config?.text_color,
          background: '#f3f3f3'
        }}
      >
        <img src="/menu-bars.png" alt="Menu" className="h-6 w-6" />
      </button>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent className="bg-white dark:bg-gray-900">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
          </SheetHeader>

          <div className="grid gap-4 py-4">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <img src="/user.png" alt="Perfil" className="w-5 h-5" />
              <span>Perfil</span>
            </button>

            <button
              onClick={() => navigate("/config")}
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <img src="/settings.png" alt="Configurações" className="w-5 h-5" />
              <span>Configurações</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <img src="/share.png" alt="Compartilhar" className="w-5 h-5" />
              <span>Compartilhar</span>
            </button>

            <button
              onClick={() => {
                setTheme(theme === "light" ? "dark" : "light");
              }}
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <img src="/dark-mode.png" alt="Tema" className="w-5 h-5" />
              <span>
                {theme === "light" ? "Modo Noturno" : "Modo Claro"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <img src="/logout.png" alt="Sair" className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MenuConfig;
