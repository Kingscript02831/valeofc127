
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { ImageIcon, VideoIcon } from "lucide-react";

interface PhotoUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  title: string;
}

const PhotoUrlDialog = ({ isOpen, onClose, onConfirm, title }: PhotoUrlDialogProps) => {
  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const handleConfirm = () => {
    // Remove qualquer dl=0 existente e outros parâmetros
    let finalUrl = url;
    
    // Se é um link do Dropbox
    if (finalUrl.includes('dropbox.com')) {
      // Remover dl=0 se existir
      finalUrl = finalUrl.replace(/[&?]dl=0/g, '');
      
      // Adicionar dl=1 no final
      finalUrl = finalUrl.includes('?') ? `${finalUrl}&dl=1` : `${finalUrl}?dl=1`;
    }

    onConfirm(finalUrl);
    setUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#232323] border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex space-x-2 mb-4">
            <Button 
              variant={mediaType === "image" ? "default" : "outline"} 
              className={mediaType === "image" ? "bg-blue-600" : "bg-transparent border-gray-600"} 
              onClick={() => setMediaType("image")}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Imagem
            </Button>
            <Button 
              variant={mediaType === "video" ? "default" : "outline"} 
              className={mediaType === "video" ? "bg-blue-600" : "bg-transparent border-gray-600"} 
              onClick={() => setMediaType("video")}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Vídeo
            </Button>
          </div>
          <Input
            placeholder="Cole aqui o link do Dropbox"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[#383838] border-gray-600 text-white placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-400 mt-2">
            Cole o link do Dropbox aqui. O sistema irá automaticamente converter para um link de download direto.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={!url.trim()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUrlDialog;
