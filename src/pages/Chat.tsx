
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatHeader } from "../components/chat/ChatHeader";
import { ChatInput } from "../components/chat/ChatInput";
import { Message, MessageType } from "../components/chat/Message";
import { v4 as uuidv4 } from "uuid";

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "1", name: "vinix" },
  { id: "2", name: "marcos" },
];

// Algumas mensagens iniciais para demonstração
const initialMessages: MessageType[] = [
  {
    id: "1",
    text: "Oi, tudo bem?",
    sender: "marcos",
    timestamp: new Date(Date.now() - 60000 * 30),
  },
  {
    id: "2",
    text: "Tudo ótimo! E com você?",
    sender: "vinix",
    timestamp: new Date(Date.now() - 60000 * 28),
  },
  {
    id: "3",
    text: "Estou bem também! O que você está fazendo?",
    sender: "marcos",
    timestamp: new Date(Date.now() - 60000 * 25),
  },
  {
    id: "4",
    text: "Estou trabalhando em um projeto novo, é muito interessante!",
    sender: "vinix",
    timestamp: new Date(Date.now() - 60000 * 20),
  },
];

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obter o usuário da query parameter ou usar o padrão
  useEffect(() => {
    const userName = searchParams.get("user");
    if (userName) {
      const user = users.find(u => u.name.toLowerCase() === userName.toLowerCase());
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [searchParams]);

  // Role para o final quando as mensagens mudarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage: MessageType = {
      id: uuidv4(),
      text,
      sender: currentUser.name,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Simular uma resposta do outro usuário
    setTimeout(() => {
      const otherUser = users.find(u => u.name !== currentUser.name);
      if (otherUser) {
        const responseMessage: MessageType = {
          id: uuidv4(),
          text: `Resposta automática de ${otherUser.name}: Recebi sua mensagem`,
          sender: otherUser.name,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMessage]);
      }
    }, 1000);
  };

  const otherUser = users.find(u => u.name !== currentUser.name);

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5]">
      <ChatHeader recipient={otherUser?.name || ""} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={message.sender === currentUser.name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} />
      
      <div className="fixed bottom-20 right-6">
        <button
          onClick={() => setCurrentUser(currentUser.id === "1" ? users[1] : users[0])}
          className="bg-[#075E54] text-white p-3 rounded-full shadow-lg"
        >
          Trocar para {currentUser.id === "1" ? "marcos" : "vinix"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
