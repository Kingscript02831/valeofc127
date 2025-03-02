
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

interface PhotoUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
  title: string;
}

const PhotoUrlDialog = ({ isOpen, onClose, onConfirm, title }: PhotoUrlDialogProps) => {
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleConfirm = () => {
    // Remover qualquer dl=0 existente e outros parâmetros
    let finalUrl = url;
    setIsValidating(true);
    
    try {
      // Se é um link do Dropbox
      if (finalUrl.includes('dropbox.com')) {
        // Substitua www.dropbox.com por dl.dropboxusercontent.com
        if (finalUrl.includes('www.dropbox.com')) {
          finalUrl = finalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        }
        
        // Remover dl=0 se existir
        finalUrl = finalUrl.replace(/[&?]dl=0/g, '');
        
        // Adicionar dl=1 no final
        finalUrl = finalUrl.includes('?') ? `${finalUrl}&dl=1` : `${finalUrl}?dl=1`;
      }
      
      // Testar se a URL é válida
      new URL(finalUrl);
      
      onConfirm(finalUrl);
      setUrl("");
      onClose();
    } catch (error) {
      console.error("URL inválida:", error);
      alert("URL inválida. Por favor, insira uma URL válida.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#332D2D] border-gray-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Cole aqui o link do Dropbox"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-[#453B3B] border-gray-600 text-white placeholder:text-gray-400"
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
            disabled={!url.trim() || isValidating}
          >
            {isValidating ? "Validando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUrlDialog;
