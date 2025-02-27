
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
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  last_read_at: string;
  profile?: {
    username?: string;
    avatar_url?: string;
    name?: string;
    online_status?: boolean;
    last_seen?: string;
  };
}
