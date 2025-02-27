
export interface Participant {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  last_read_at: string;
  profile?: {
    username?: string;
    name?: string;
    avatar_url?: string;
    online_status?: boolean;
    last_seen?: string;
  }
}

export interface ChatMessage {
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
  participants: Participant[];
  messages: ChatMessage[];
}
