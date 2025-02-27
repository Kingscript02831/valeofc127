
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  recipient: string;
  avatar?: string;
  isOnline?: boolean;
}

export const ChatHeader = ({ recipient, avatar, isOnline = false }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary text-white p-4 flex items-center gap-2 sticky top-0 z-10">
      <button onClick={() => navigate("/chat")} className="p-1">
        <ArrowLeft className="h-6 w-6" />
      </button>
      
      <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {avatar ? (
            <img 
              src={avatar} 
              alt={recipient} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
              {recipient[0].toUpperCase()}
            </div>
          )}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-primary" />
        )}
      </div>
      
      <div className="flex-1 ml-1">
        <h1 className="font-semibold">{recipient}</h1>
        <p className="text-xs opacity-80">
          {isOnline ? 'Online agora' : 'Offline'}
        </p>
      </div>
      
      <button className="p-2">
        <MoreVertical className="h-5 w-5" />
      </button>
    </div>
  );
};
