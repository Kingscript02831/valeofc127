
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { MenuButton } from "./menu/MenuButton";
import { MenuItems } from "./menu/MenuItems";
import { MenuFooter } from "./menu/MenuFooter";
import { menuItems } from "./menu/types";

const MenuConfig = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <MenuButton onClick={toggleMenu} />

      <div
        className={`fixed top-0 right-0 bottom-0 w-72 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } bg-background dark:bg-background shadow-lg border-l border-border`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-foreground">Menu</h1>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-accent/10 transition-colors duration-200"
            >
              <img src="/close.png" alt="Fechar" className="h-5 w-5" />
            </button>
          </div>

          <MenuItems items={menuItems} onItemClick={toggleMenu} />
          <MenuFooter onShare={handleShare} onLogout={handleLogout} />
        </div>
      </div>
    </>
  );
};

export default MenuConfig;
