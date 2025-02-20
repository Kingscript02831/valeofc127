
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  type: "profile" | "cover";
}

export function DeletePhotoDialog({ open, onOpenChange, onDelete, type }: DeletePhotoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Remover foto {type === "profile" ? "de perfil" : "de capa"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          Tem certeza que deseja remover sua foto {type === "profile" ? "de perfil" : "de capa"}?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
