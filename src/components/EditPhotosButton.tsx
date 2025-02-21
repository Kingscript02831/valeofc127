
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Camera } from "lucide-react";

interface EditPhotosButtonProps {
  onAvatarClick: () => void;
  onCoverClick: () => void;
}

const EditPhotosButton = ({ onAvatarClick, onCoverClick }: EditPhotosButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="text-white border-gray-700">
          <Camera className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onAvatarClick}>
          <Camera className="h-4 w-4 mr-2" />
          Alterar foto de perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCoverClick}>
          <Camera className="h-4 w-4 mr-2" />
          Alterar capa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditPhotosButton;
