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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, Trash2, Link2, ArrowLeft, Search } from "lucide-react";

const defaultAvatarImage = "/placeholder.svg";
const defaultCoverImage = "/placeholder.svg";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const [showDropboxInput, setShowDropboxInput] = useState(false);
  const [dropboxLink, setDropboxLink] = useState("");
  const [isForProfile, setIsForProfile] = useState(true);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
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
      return data;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (newData: any) => {
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

  const handleUpdateImage = (isProfile: boolean, url: string) => {
    const field = isProfile ? 'avatar_url' : 'cover_url';
    updateProfile.mutate({ [field]: url });
  };

  const handleDeleteImage = (isProfile: boolean) => {
    const field = isProfile ? 'avatar_url' : 'cover_url';
    updateProfile.mutate({ [field]: null });
    toast({
      title: `${isProfile ? 'Foto de perfil' : 'Foto de capa'} removida`,
      description: `Sua ${isProfile ? 'foto de perfil' : 'foto de capa'} foi removida com sucesso`,
    });
  };

  const handleDropboxSubmit = () => {
    if (dropboxLink) {
      handleUpdateImage(isForProfile, dropboxLink);
      setDropboxLink("");
      setShowDropboxInput(false);
    }
  };

  if (isProfileLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-background/90 backdrop-blur">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
        <div className="flex-1" />
        <button>
          <Search className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          {/* Cover Photo Section */}
          <div className="h-32 bg-gray-200 relative">
            {profile?.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Sem Capa de Perfil</p>
              </div>
            )}
            {!isPreviewMode && (
              <div className="absolute right-4 bottom-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-black/50 hover:bg-black/70"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setIsForProfile(false);
                        setShowDropboxInput(true);
                      }}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Adicionar link do Dropbox
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteImage(false)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover foto de capa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Profile Photo Section */}
          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatarImage;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">Sem foto de perfil</p>
                  </div>
                )}
              </div>
              {!isPreviewMode && (
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
                      <DropdownMenuItem
                        onClick={() => {
                          setIsForProfile(true);
                          setShowDropboxInput(true);
                        }}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Adicionar link do Dropbox
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteImage(true)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover foto de perfil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                  <p className="text-muted-foreground">@{profile?.username}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  {isPreviewMode ? "Editar perfil" : "Ver perfil"}
                </Button>
              </div>

              {profile?.bio && (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}

              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="replies">Replies</TabsTrigger>
                  <TabsTrigger value="likes">Likes</TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum post ainda</p>
                  </div>
                </TabsContent>
                <TabsContent value="replies">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma resposta ainda</p>
                  </div>
                </TabsContent>
                <TabsContent value="likes">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum like ainda</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Dropbox Link Dialog */}
      <Dialog open={showDropboxInput} onOpenChange={setShowDropboxInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar link do Dropbox para {isForProfile ? 'foto de perfil' : 'foto de capa'}
            </DialogTitle>
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
            <Button onClick={handleDropboxSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
