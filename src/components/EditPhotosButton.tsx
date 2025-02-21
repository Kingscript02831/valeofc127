
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Camera, Trash2 } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface EditPhotosButtonProps {
  onAvatarClick: () => void;
  onCoverClick: () => void;
  onDeleteAvatar: () => void;
  onDeleteCover: () => void;
  avatarCount?: number;
  coverCount?: number;
}

const EditPhotosButton = ({ 
  onAvatarClick, 
  onCoverClick, 
  onDeleteAvatar, 
  onDeleteCover,
  avatarCount = 0,
  coverCount = 0
}: EditPhotosButtonProps) => {
  const { theme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`border-gray-700 ${theme === 'light' ? 'text-black' : 'text-white'}`}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
        <DropdownMenuItem onClick={onAvatarClick} className="text-white cursor-pointer">
          <Camera className="h-4 w-4 mr-2" />
          Alterar foto de perfil ({avatarCount})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCoverClick} className="text-white cursor-pointer">
          <Camera className="h-4 w-4 mr-2" />
          Alterar capa ({coverCount})
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={onDeleteAvatar} className="text-red-500 cursor-pointer">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir foto de perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDeleteCover} className="text-red-500 cursor-pointer">
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir capa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditPhotosButton;
