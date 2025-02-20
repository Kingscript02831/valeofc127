
import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Trash2 } from "lucide-react";

export default function Profile() {
  const { id } = useParams();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const [showAddCoverDialog, setShowAddCoverDialog] = useState(false);
  const [newCoverUrl, setNewCoverUrl] = useState("");

  const handleCoverImageClick = () => {
    setShowAddCoverDialog(true);
  };

  const handleAddCover = async () => {
    try {
      if (!newCoverUrl) return;

      const { data: profile } = await supabase
        .from("profiles")
        .update({ cover_url: newCoverUrl })
        .eq("id", id)
        .select()
        .single();

      if (profile) {
        setShowAddCoverDialog(false);
        setNewCoverUrl("");
        toast({
          title: "Foto de capa atualizada",
          description: "Sua foto de capa foi atualizada com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar foto de capa",
        description: "Ocorreu um erro ao tentar atualizar sua foto de capa",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCover = async () => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .update({ cover_url: null })
        .eq("id", id)
        .select()
        .single();

      if (profile) {
        setShowDeleteCoverDialog(false);
        toast({
          title: "Foto de capa removida",
          description: "Sua foto de capa foi removida com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao remover foto de capa",
        description: "Ocorreu um erro ao tentar remover sua foto de capa",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
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
          {!isPreviewMode && (
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button
                onClick={() => setShowDeleteCoverDialog(true)}
                className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={handleCoverImageClick}
                className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para adicionar foto de capa */}
      <Dialog open={showAddCoverDialog} onOpenChange={setShowAddCoverDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar foto de capa</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-gray-400">
            Cole o link da imagem do Dropbox para definir como sua foto de capa
          </DialogDescription>
          <Input
            id="cover-url"
            placeholder="Cole o link aqui"
            className="bg-gray-800 border-gray-700 text-white"
            value={newCoverUrl}
            onChange={(e) => setNewCoverUrl(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCoverDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCover}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar remoção da foto de capa */}
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
