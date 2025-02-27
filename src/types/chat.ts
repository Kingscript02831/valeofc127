
export interface Chat {
  id: string;
  created_at: string;
  last_message?: string;
  last_message_time?: string;
  participants?: ChatParticipant[];
  other_user?: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface SendMessageParams {
  chat_id: string;
  content: string;
}
