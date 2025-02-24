
import { Dialog, DialogContent } from "./ui/dialog";

interface SearchUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchUsersDialog({ open, onOpenChange }: SearchUsersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Buscar Usuários</h2>
          {/* Implementação da busca será adicionada depois */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
