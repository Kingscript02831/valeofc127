
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Profile } from "@/types/chat";

interface ChatHeaderProps {
  otherParticipant: Partial<Profile>;
}

export function ChatHeader({ otherParticipant }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-white/80"
            onClick={() => navigate("/conversations")}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {otherParticipant.avatar_url ? (
                  <img
                    src={otherParticipant.avatar_url}
                    alt={otherParticipant.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-white">
                    {otherParticipant.name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1F2C]" />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {otherParticipant.name || otherParticipant.username || "Usuário"}
              </h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <Phone className="h-5 w-5" />
          <MoreVertical className="h-5 w-5 cursor-pointer" />
        </div>
      </div>
      {otherParticipant.bio && (
        <div className="mt-2 px-14 text-sm text-white/80">
          {otherParticipant.bio}
        </div>
      )}
    </div>
  );
}
