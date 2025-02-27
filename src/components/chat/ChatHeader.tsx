
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  recipient: string;
  status?: "online" | "offline" | string;
  recipientAvatar?: string;
}

export const ChatHeader = ({ recipient, status = "offline", recipientAvatar }: ChatHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={() => navigate("/chat")}
          className="mr-2 p-1 rounded-full hover:bg-[#128C7E] transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback>
            {recipient?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="font-semibold">{recipient}</h2>
          <p className="text-xs opacity-80">
            {status === "online" ? (
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                Online
              </span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="p-2 rounded-full hover:bg-[#128C7E] transition mr-1">
          <Phone className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-[#128C7E] transition mr-1">
          <Video className="h-5 w-5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-[#128C7E] transition">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
            <DropdownMenuItem>Limpar conversa</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Bloquear usuário</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
