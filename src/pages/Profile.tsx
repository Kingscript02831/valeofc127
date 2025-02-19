import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, Trash2, Link2 } from "lucide-react";
import type { Profile, ProfileUpdateData } from "../types/profile";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDropboxInput, setShowDropboxInput] = useState(false);
  const [dropboxLink, setDropboxLink] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (newData: ProfileUpdateData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .update(newData)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Perfil atualizado",
        description: "Suas alterações foram salvas com sucesso",
      });
    }
  });

  const handleUpdateProfilePicture = (url: string) => {
    updateProfile.mutate({ avatar_url: url });
  };

  const handleDeleteProfilePicture = () => {
    updateProfile.mutate({ avatar_url: null });
    toast({
      title: "Foto removida",
      description: "Sua foto de perfil foi removida com sucesso",
    });
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
      navigate("/login");
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <Button variant="destructive" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="relative -mt-16 px-4">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Sem foto</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDropboxInput(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Adicionar link do Dropbox
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteProfilePicture}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover foto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dropbox Link Dialog */}
      <Dialog open={showDropboxInput} onOpenChange={setShowDropboxInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar link do Dropbox</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Cole o link do Dropbox aqui"
            value={dropboxLink}
            onChange={(e) => setDropboxLink(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDropboxInput(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (dropboxLink) {
                handleUpdateProfilePicture(dropboxLink);
                setDropboxLink("");
                setShowDropboxInput(false);
              }
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto mt-8 px-4">
        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Nome de usuário
                    </label>
                  </div>
                  <Input
                    type="text"
                    id="username"
                    placeholder="Nome de usuário"
                    defaultValue={profile.username || ""}
                    onBlur={(e) =>
                      updateProfile.mutate({ username: e.target.value })
                    }
                  />
                </div>
                <div>
                  <div className="mb-2">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Nome completo
                    </label>
                  </div>
                  <Input
                    type="text"
                    id="fullName"
                    placeholder="Nome completo"
                    defaultValue={profile.full_name || ""}
                    onBlur={(e) =>
                      updateProfile.mutate({ full_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                  </div>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    defaultValue={profile.email || ""}
                    onBlur={(e) =>
                      updateProfile.mutate({ email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <div className="mb-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Telefone
                    </label>
                  </div>
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="Telefone"
                    defaultValue={profile.phone || ""}
                    onBlur={(e) =>
                      updateProfile.mutate({ phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Bio
                  </label>
                </div>
                <Input
                  type="text"
                  id="bio"
                  placeholder="Bio"
                  defaultValue={profile.bio || ""}
                  onBlur={(e) =>
                    updateProfile.mutate({ bio: e.target.value })
                  }
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="appearance">
            <div className="grid gap-4">
              <div>
                <div className="mb-2">
                  <label
                    htmlFor="coverUrl"
                    className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    URL da capa
                  </label>
                </div>
                <Input
                  type="text"
                  id="coverUrl"
                  placeholder="URL da capa"
                  defaultValue={profile.cover_url || ""}
                  onBlur={(e) =>
                    updateProfile.mutate({ cover_url: e.target.value })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
