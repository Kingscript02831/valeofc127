
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { Message, MessageType } from "@/components/chat/Message";

// Função para gerar IDs únicos
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

type User = {
  id: string;
  name: string;
};

const users: User[] = [
  { id: "1", name: "vinix" },
  { id: "2", name: "marcos" },
];

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [recipient, setRecipient] = useState("Carregando...");
  const [recipientAvatar, setRecipientAvatar] = useState<string | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simular obtenção de dados do chat
  useEffect(() => {
    // Em uma implementação real, buscaríamos o chat e mensagens do Supabase
    // com base no chatId
    
    // Simulando a obtenção do recipiente
    const otherUser = users.find(u => u.name !== currentUser.name);
    if (otherUser) {
      setRecipient(otherUser.name);
      setIsOnline(true);
    }
  }, [chatId, currentUser]);

  // Rolar para o final quando as mensagens mudarem
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

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader 
        recipient={recipient} 
        avatar={recipientAvatar} 
        isOnline={isOnline} 
      />
      
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
          className="bg-primary text-white p-3 rounded-full shadow-lg"
        >
          Trocar para {currentUser.id === "1" ? "marcos" : "vinix"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
