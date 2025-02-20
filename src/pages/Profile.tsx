import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { ProfileConfig } from "../components/profileconfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreVertical, Settings } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import type { Profile } from "../types/profile";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const { theme } = useTheme();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
      setShowSettings(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center">
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile?.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <p className="text-gray-500">Sem Capa de Perfil</p>
              </div>
            )}
          </div>

          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                    <p className="text-gray-500">Sem foto de perfil</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                <p className="text-gray-400">@{profile?.username}</p>
              </div>

              <div className="flex flex-col gap-2">
                {!isPreviewMode ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/config")}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ProfileConfig 
                      profile={profile}
                      isPreviewMode={isPreviewMode}
                      locations={locations}
                      handleAvatarImageClick={handleAvatarImageClick}
                      handleCoverImageClick={handleCoverImageClick}
                      setShowDeletePhotoDialog={setShowDeletePhotoDialog}
                      setShowDeleteCoverDialog={setShowDeleteCoverDialog}
                      onSubmit={updateProfile.mutate}
                    />
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsPreviewMode(false)} 
                    variant="outline" 
                    className={`${theme === 'light' ? 'text-black border-gray-300' : 'text-white border-gray-700'}`}
                  >
                    Sair do modo preview
                  </Button>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className={`mb-4 ${theme === 'light' ? 'text-black' : 'text-gray-300'}`}>{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remover foto de perfil</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Tem certeza que deseja remover sua foto de perfil?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePhotoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAvatar}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteCoverDialog} onOpenChange={setShowDeleteCoverDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remover foto de capa</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Tem certeza que deseja remover sua foto de capa?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCoverDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCover}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
