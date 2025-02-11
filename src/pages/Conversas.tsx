
import { useState } from "react";

interface Message {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const Conversas = () => {
  const [conversations, setConversations] = useState<Message[]>([
    {
      id: 1,
      name: "João Silva",
      lastMessage: "Olá, tudo bem?",
      time: "10:30",
      unread: 2,
    },
    {
      id: 2,
      name: "Maria Santos",
      lastMessage: "Vamos marcar aquela reunião?",
      time: "09:45",
      unread: 0,
    },
  ]);

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="space-y-2">
        {conversations.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div>
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                <p className="text-sm text-gray-600">{chat.lastMessage}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{chat.time}</p>
              {chat.unread > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#25D366] text-white text-xs font-medium rounded-full mt-1">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Conversas;
