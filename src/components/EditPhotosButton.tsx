
import React from 'react';
import { Button } from "./ui/button";
import { Camera, FileImage, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface EditPhotosButtonProps {
  onAvatarClick: () => void;
  onCoverClick: () => void;
  onDeleteAvatar: () => void;
  onDeleteCover: () => void;
  avatarCount: number;
  coverCount: number;
}

const EditPhotosButton = ({
  onAvatarClick,
  onCoverClick,
  onDeleteAvatar,
  onDeleteCover,
  avatarCount,
  coverCount,
}: EditPhotosButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-700">
          <Camera className="h-4 w-4 mr-2" />
          Fotos
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-800">
        <DropdownMenuItem onClick={onAvatarClick} className="text-white cursor-pointer">
          <FileImage className="h-4 w-4 mr-2" />
          {avatarCount > 0 ? "Alterar foto de perfil" : "Adicionar foto de perfil"}
        </DropdownMenuItem>
        {avatarCount > 0 && (
          <DropdownMenuItem onClick={onDeleteAvatar} className="text-red-400 cursor-pointer">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir foto de perfil
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onCoverClick} className="text-white cursor-pointer">
          <FileImage className="h-4 w-4 mr-2" />
          {coverCount > 0 ? "Alterar capa" : "Adicionar capa"}
        </DropdownMenuItem>
        {coverCount > 0 && (
          <DropdownMenuItem onClick={onDeleteCover} className="text-red-400 cursor-pointer">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir capa
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditPhotosButton;
