
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  messages: Message[];
}

export interface ChatParticipant {
  id: string;
  chat_id?: string;
  user_id: string;
  created_at?: string;
  last_read_at: string;
  profiles: {
    id?: string;
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}
