
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  user: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export function ChatHeader({ user }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b p-3 dark:border-gray-700">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/chat-home")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="mr-2 h-10 w-10">
          <AvatarImage src={user.avatar_url || ''} />
          <AvatarFallback>
            {user.full_name?.charAt(0) || user.username?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.full_name || user.username}</h3>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
      </div>
    </div>
  );
}
