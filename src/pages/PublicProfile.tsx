
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProfileTabs from "@/components/ProfileTabs";
import { useTheme } from "@/components/ThemeProvider";
import type { Profile } from "@/types/profile";
import type { ProductWithDistance } from "@/types/products";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

export default function PublicProfile() {
  const { username } = useParams();
  const { theme } = useTheme();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: userProducts } = useQuery({
    queryKey: ["user-products", profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", profile.id);

      if (error) throw error;
      return data as ProductWithDistance[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
          <p className="text-gray-600">O usuário que você procura não existe.</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 mt-4 inline-block">
            Voltar para a página inicial
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className="pt-4 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'}`}>
                <p className="text-gray-500">Sem Capa</p>
              </div>
            )}
          </div>

          <div className="px-4">
            <div className="relative -mt-16 mb-4 flex justify-center">
              <div className="relative">
                <img
                  src={profile.avatar_url || defaultAvatarImage}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatarImage;
                  }}
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">{profile.name || profile.username}</h1>
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">{profile.bio}</p>
              )}
            </div>

            <ProfileTabs userProducts={userProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}
