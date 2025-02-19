import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";
import { useTheme } from "@/components/ThemeProvider";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      return data as Profile;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: Partial<Profile>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCover = async () => {
    updateProfile.mutate({ cover_url: null });
    setShowDeleteCoverDialog(false);
  };

  const handleCoverImageClick = () => {
    const coverUrl = prompt("Cole aqui o link do Dropbox para a imagem de capa:");
    if (coverUrl) {
      updateProfile.mutate({ cover_url: coverUrl });
    }
  };

  if (isProfileLoading) {
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
            <button 
              onClick={() => setShowDeleteCoverDialog(true)}
              className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <Trash2 className="h-5 w-5 text-white" />
            </button>
            <button 
              onClick={handleCoverImageClick}
              className="bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="absolute top-2 left-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
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

      <div className="container mx-auto py-6">
        <div className="grid gap-4">
          <div className="text-center">
            <img
              src={profile?.avatar_url}
              alt="Avatar"
              className="rounded-full h-32 w-32 mx-auto object-cover"
            />
            <h1 className="text-2xl font-semibold mt-2">
              {profile?.full_name || "Nome não definido"}
            </h1>
            <p className="text-muted-foreground">@{profile?.username}</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Informações básicas</h2>
                  <div className="grid gap-2 mt-2">
                    <p>
                      <strong>Email:</strong> {profile?.email}
                    </p>
                    <p>
                      <strong>Telefone:</strong> {profile?.phone || "Não
                      informado"}
                    </p>
                    <p>
                      <strong>Data de nascimento:</strong>{" "}
                      {profile?.birth_date
                        ? format(new Date(profile.birth_date), "dd/MM/yyyy")
                        : "Não informada"}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      {profile?.website || "Não informado"}
                    </p>
                    <p>
                      <strong>Bio:</strong> {profile?.bio || "Nenhuma bio"}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Endereço</h2>
                  <div className="grid gap-2 mt-2">
                    <p>
                      <strong>Cidade:</strong> {profile?.city || "Não informada"}
                    </p>
                    <p>
                      <strong>Rua:</strong> {profile?.street || "Não informada"}
                      ,{" "}
                      {profile?.house_number || "SN"}
                    </p>
                    <p>
                      <strong>CEP:</strong> {profile?.postal_code || "Não
                      informado"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Atualizar informações
                  </h2>
                  <div className="grid gap-4 mt-2">
                    <div>
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="name"
                      >
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        defaultValue={profile?.full_name || ""}
                        onChange={(e) =>
                          updateProfile.mutate({
                            full_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <Input
                        id="username"
                        placeholder="Seu username"
                        defaultValue={profile?.username || ""}
                        onChange={(e) =>
                          updateProfile.mutate({ username: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
