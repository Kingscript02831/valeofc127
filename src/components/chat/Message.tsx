
interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

export interface MessageType {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export const Message = ({ message, isCurrentUser }: MessageProps) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${
          isCurrentUser
            ? 'bg-[#DCF8C6] text-gray-800'
            : 'bg-white text-gray-800'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-gray-600' : 'text-gray-500'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
