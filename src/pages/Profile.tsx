import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, Trash2 } from "lucide-react";
import type { Profile, ProfileUpdateData } from "@/types/profile";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);

  const { data: profile, isLoading } = useQuery({
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
      return data as Profile;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (updateData: ProfileUpdateData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      setShowDeleteCoverDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddCover = () => {
    const coverUrl = prompt("Cole aqui o link da imagem de capa:");
    if (coverUrl) {
      updateProfile.mutate({ cover_url: coverUrl });
    }
  };

  const handleDeleteCover = () => {
    updateProfile.mutate({ cover_url: null });
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Capa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-muted-foreground">Sem foto de capa</p>
            </div>
          )}
          
          <div className="absolute right-4 bottom-4 flex gap-2">
            {profile?.cover_url && (
              <button 
                onClick={() => setShowDeleteCoverDialog(true)}
                className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            )}
            <button 
              onClick={handleAddCover}
              className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative -mt-16">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <span className="text-2xl text-muted-foreground">
                          {profile?.full_name?.[0] || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {profile?.full_name || "Nome não definido"}
                  </h1>
                  <p className="text-muted-foreground">
                    @{profile?.username || "username"}
                  </p>
                </div>
                <Button onClick={() => navigate("/settings/profile")}>
                  Editar Perfil
                </Button>
              </div>
              {profile?.bio && (
                <p className="mt-4 text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteCoverDialog} onOpenChange={setShowDeleteCoverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover foto de capa</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja remover sua foto de capa?</p>
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
