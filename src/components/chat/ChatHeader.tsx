
interface ChatHeaderProps {
  recipient: string;
  status?: string;
  recipientAvatar?: string;
}

export const ChatHeader = ({ 
  recipient, 
  status = "online",
  recipientAvatar
}: ChatHeaderProps) => {
  return (
    <div className="bg-[#075E54] text-white p-3 flex items-center shadow-md">
      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3 overflow-hidden">
        {recipientAvatar ? (
          <img src={recipientAvatar} alt={recipient} className="w-full h-full object-cover" />
        ) : (
          recipient.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <h2 className="font-medium">{recipient}</h2>
        <p className="text-xs opacity-75 flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${status === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          {status === 'online' ? 'Online' : 'Offline'}
        </p>
      </div>
      <div className="flex space-x-4">
        <button className="text-white hover:bg-[#128C7E] p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button className="text-white hover:bg-[#128C7E] p-2 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
