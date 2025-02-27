
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatParticipant, Message, SendMessageParams } from "@/types/chat";

export const chatService = {
  async getUserChats(): Promise<Chat[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser?.user) return [];

    const { data: chats, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        chat_participants!inner(user_id),
        chat_participants(
          user_id,
          user:profiles(id, username, full_name, avatar_url)
        )
      `)
      .contains('chat_participants.user_id', [currentUser.user.id])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }

    // Get the last message for each chat
    const enhancedChats = await Promise.all(
      chats.map(async (chat) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Find the other participant in the chat
        const otherParticipant = chat.chat_participants.find(
          (p: any) => p.user_id !== currentUser.user?.id
        );

        return {
          ...chat,
          last_message: messages && messages.length > 0 ? messages[0].content : undefined,
          last_message_time: messages && messages.length > 0 ? messages[0].created_at : undefined,
          other_user: otherParticipant?.user
        };
      })
    );

    return enhancedChats;
  },

  async getChatMessages(chatId: string): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        chat_id,
        user_id,
        content,
        created_at,
        user:profiles(username, full_name, avatar_url)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return messages || [];
  },

  async sendMessage({ chat_id, content }: SendMessageParams): Promise<Message | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id,
        user_id: user.id,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  },

  async createChat(otherUserId: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .rpc('create_private_chat', {
        other_user_id: otherUserId
      });

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    return data;
  },

  subscribeToMessages(chatId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }
};
