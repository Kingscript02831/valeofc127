
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { useTheme } from "../components/ThemeProvider";
import { ArrowLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import FollowersList from "../components/FollowersList";
import type { Profile } from "../types/profile";

export default function FollowersPage() {
  const { userId, tab = "followers" } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isFollowersOpen, setIsFollowersOpen] = useState(true);

  // Obter detalhes do perfil para exibir o nome do usuário no cabeçalho
  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }

      return data as Profile;
    },
    enabled: !!userId,
  });

  const handleClose = () => {
    setIsFollowersOpen(false);
    setTimeout(() => navigate(-1), 300); // Pequeno atraso para a animação do Sheet
  };

  // Titulo baseado na aba atual
  const getTitle = () => {
    if (!profile) return "Conexões";
    
    const name = profile.username || "Usuário";
    switch (tab) {
      case "followers":
        return `Seguidores de ${name}`;
      case "following":
        return `${name} está seguindo`;
      case "notFollowing":
        return "Sugestões de pessoas";
      default:
        return "Conexões";
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{getTitle()}</h1>
          </div>
        </div>
      </div>

      <div className="pt-16 pb-20">
        {/* Este div é apenas um espaço de preenchimento, já que o componente FollowersList será um Sheet */}
        <div className="p-4">
          <p className="text-center text-gray-400">
            Carregando informações de conexões...
          </p>
        </div>
      </div>

      {userId && (
        <FollowersList 
          userId={userId} 
          isOpen={isFollowersOpen} 
          onClose={handleClose} 
        />
      )}

      <BottomNav />
    </div>
  );
}
