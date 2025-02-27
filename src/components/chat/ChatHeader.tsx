
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  recipient: string;
  status: string;
  recipientAvatar?: string;
}

export const ChatHeader = ({ recipient, status, recipientAvatar }: ChatHeaderProps) => {
  return (
    <div className="bg-[#075E54] text-white p-4 flex items-center shadow-md">
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={recipientAvatar} />
        <AvatarFallback>
          {recipient[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold">{recipient}</h2>
        <p className="text-sm text-gray-200">{status}</p>
      </div>
    </div>
  );
};
