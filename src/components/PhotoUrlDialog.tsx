
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

  const handleConfirm = () => {
    // Verifica se já existe dl= na URL
    let finalUrl = url;
    if (url && !url.includes('dl=')) {
      finalUrl = url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
    }
    onConfirm(finalUrl);
    setUrl("");
    onClose();
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
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoUrlDialog;
