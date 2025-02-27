
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    async function checkCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setIsCurrentUser(data.user.id === message.user_id);
      }
    }

    checkCurrentUser();
  }, [message.user_id]);

  const formattedTime = format(new Date(message.created_at), "HH:mm", {
    locale: ptBR,
  });

  return (
    <div
      className={`mb-4 flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <Avatar className="mr-2 h-8 w-8">
          <AvatarImage src={message.user?.avatar_url || ""} />
          <AvatarFallback>
            {message.user?.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="break-words">{message.content}</div>
        <div
          className={`mt-1 text-right text-xs ${
            isCurrentUser ? "text-primary-foreground/70" : "text-foreground/70"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
