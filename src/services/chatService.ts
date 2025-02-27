
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatParticipant, Message } from "@/types/chat";

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        updated_at,
        chat_participants:chat_participants(
          id,
          user_id,
          created_at,
          last_read_at,
          profiles:user_id(
            username,
            avatar_url,
            full_name
          )
        ),
        messages:messages(
          id,
          sender_id,
          content,
          created_at,
          read
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }

    return data as Chat[];
  },

  async getChatById(chatId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        updated_at,
        chat_participants:chat_participants(
          id,
          user_id,
          created_at,
          last_read_at,
          profiles:user_id(
            username,
            avatar_url,
            full_name,
            online_status,
            last_seen
          )
        ),
        messages:messages(
          id,
          chat_id,
          sender_id,
          content,
          created_at,
          read
        )
      `)
      .eq('id', chatId)
      .single();

    if (error) {
      console.error("Error fetching chat:", error);
      return null;
    }

    return data as Chat;
  },

  async sendMessage(chatId: string, content: string): Promise<Message | null> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error("User not authenticated");
      return null;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      return null;
    }

    // Update chat's updated_at timestamp
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data as Message;
  },

  async createChat(otherUserId: string): Promise<string | null> {
    const { data, error } = await supabase
      .rpc('create_private_chat', { other_user_id: otherUserId });

    if (error) {
      console.error("Error creating chat:", error);
      return null;
    }

    return data as string;
  },

  async markMessagesAsRead(chatId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error("User not authenticated");
      return;
    }

    // Update last_read_at for the current user in this chat
    await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', user.user.id);
    
    // Mark all messages in this chat as read
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', user.user.id)
      .eq('read', false);
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, full_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  },

  async getCurrentUserProfile() {
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return null;
    }

    return this.getUserProfile(authData.user.id);
  }
};
