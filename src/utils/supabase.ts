
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Cria ou obtém um chat entre dois usuários
 * @param currentUserId ID do usuário atual
 * @param recipientId ID do destinatário
 * @returns ID da sala de chat
 */
export const createOrGetChat = async (currentUserId: string, recipientId: string): Promise<string> => {
  try {
    // Verificar se já existe um chat entre esses usuários
    const chatId = [currentUserId, recipientId].sort().join('_');
    
    // Verificar se o chat existe
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Erro ao verificar chat existente:", checkError);
      throw new Error("Não foi possível verificar se o chat já existe");
    }
    
    // Se o chat não existir, criar um novo
    if (!existingChat) {
      console.log("Criando novo chat:", chatId);
      
      // Inserir o chat
      const { error: createError } = await supabase
        .from('chats')
        .insert({ 
          id: chatId,
          status: 'active',
          initiator_id: currentUserId
        });
        
      if (createError) {
        console.error("Erro ao criar chat:", createError);
        throw new Error("Não foi possível criar o chat");
      }
      
      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chatId, user_id: currentUserId },
          { chat_id: chatId, user_id: recipientId }
        ]);
        
      if (participantsError) {
        console.error("Erro ao adicionar participantes:", participantsError);
        throw new Error("Não foi possível adicionar os participantes ao chat");
      }
      
      console.log("Chat criado com sucesso");
    } else {
      console.log("Chat já existe:", existingChat);
    }
    
    return chatId;
  } catch (error) {
    console.error("Erro em createOrGetChat:", error);
    throw error;
  }
};

/**
 * Envia uma mensagem para um chat
 * @param chatId ID do chat
 * @param senderId ID do remetente
 * @param content Conteúdo da mensagem
 * @returns ID da mensagem
 */
export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<string> => {
  try {
    const messageId = crypto.randomUUID();
    
    const { error } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw new Error("Não foi possível enviar a mensagem");
    }
    
    return messageId;
  } catch (error) {
    console.error("Erro em sendMessage:", error);
    throw error;
  }
};

/**
 * Marca todas as mensagens não lidas como lidas
 * @param chatId ID do chat
 * @param userId ID do usuário
 */
export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', userId)
      .eq('read', false);
      
    if (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
    }
  } catch (error) {
    console.error("Erro em markMessagesAsRead:", error);
  }
};

/**
 * Obtém o perfil de um usuário
 * @param userId ID do usuário
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Erro ao obter perfil do usuário:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erro em getUserProfile:", error);
    throw error;
  }
};
