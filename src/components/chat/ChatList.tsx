
import { useState } from "react";
import { Link } from "react-router-dom";

type ChatPreview = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
};

const initialChats: ChatPreview[] = [
  {
    id: "1",
    name: "vinix",
    lastMessage: "Estou trabalhando em um projeto novo",
    timestamp: new Date(Date.now() - 60000 * 20),
    unread: 0,
  },
  {
    id: "2",
    name: "marcos",
    lastMessage: "Estou bem também! O que você está fazendo?",
    timestamp: new Date(Date.now() - 60000 * 25),
    unread: 2,
  },
];

export const ChatList = () => {
  const [chats] = useState<ChatPreview[]>(initialChats);
  
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-[#075E54] text-white p-3">
        <h1 className="text-xl font-bold">WhatsApp</h1>
      </div>
      
      <div className="flex items-center p-2 bg-[#F6F6F6]">
        <input
          type="text"
          placeholder="Search or start new chat"
          className="w-full bg-white rounded-full px-4 py-2 text-sm focus:outline-none"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Link 
            to={`/chat?user=${chat.name}`} 
            key={chat.id}
            className="flex items-center p-3 border-b hover:bg-gray-100"
          >
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
              {chat.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{chat.name}</span>
                <span className="text-xs text-gray-500">
                  {chat.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="bg-[#25D366] text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
