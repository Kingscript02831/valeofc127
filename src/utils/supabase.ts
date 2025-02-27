
import { supabase } from "@/integrations/supabase/client";

/**
 * Cria um novo chat ou retorna o ID do chat existente entre dois usuários
 */
export const createOrGetChat = async (
  userId1: string, 
  userId2: string, 
  autoAccept: boolean = false
): Promise<{chatId: string; status: 'pending' | 'active' | 'existing'}> => {
  try {
    // Criar o ID da sala de chat ordenando os IDs dos usuários
    const chatId = [userId1, userId2].sort().join('_');
    
    // Verificar se o chat já existe
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id, status')
      .eq('id', chatId)
      .single();
      
    if (checkError && checkError.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error("Erro ao verificar chat existente:", checkError);
      throw new Error("Erro ao verificar chat existente");
    }
      
    // Se o chat já existe e está ativo, retornar
    if (existingChat && existingChat.status === 'active') {
      return { chatId, status: 'existing' };
    }

    // Se não existir, criar um novo
    if (!existingChat) {
      // Criar o chat com status pendente
      const { error: createChatError } = await supabase
        .from('chats')
        .insert({ 
          id: chatId,
          status: autoAccept ? 'active' : 'pending',
          initiator_id: userId1
        });
        
      if (createChatError) {
        console.error("Erro ao criar chat:", createChatError);
        throw new Error("Erro ao criar chat");
      }
      
      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chatId, user_id: userId1 },
          { chat_id: chatId, user_id: userId2 }
        ]);
        
      if (participantsError) {
        console.error("Erro ao adicionar participantes:", participantsError);
        throw new Error("Erro ao adicionar participantes");
      }

      // Enviar notificação para o usuário destinatário
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId1)
        .single();

      if (senderProfile && !autoAccept) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId2,
            title: 'Nova solicitação de chat',
            message: `${senderProfile.username} quer iniciar uma conversa com você`,
            type: 'chat_request',
            reference_id: chatId,
            publication_title: 'Aceitar conversa?',
            publication_description: 'Clique para aceitar ou recusar',
            metadata: {
              sender_id: userId1,
              sender_name: senderProfile.username,
              sender_avatar: senderProfile.avatar_url,
              chat_id: chatId
            }
          });

        if (notificationError) {
          console.error("Erro ao criar notificação:", notificationError);
        }
      }

      return { 
        chatId, 
        status: autoAccept ? 'active' : 'pending'
      };
    }

    return { 
      chatId, 
      status: existingChat.status as 'pending' | 'active' 
    };
    
  } catch (error) {
    console.error("Erro ao criar/obter chat:", error);
    throw error;
  }
};

export const acceptChatRequest = async (chatId: string, userId: string): Promise<boolean> => {
  try {
    // Atualizar o status do chat para ativo
    const { error: updateError } = await supabase
      .from('chats')
      .update({ status: 'active' })
      .eq('id', chatId);

    if (updateError) {
      console.error("Erro ao aceitar chat:", updateError);
      return false;
    }

    // Marcar a notificação como lida
    const { error: notificationError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('reference_id', chatId)
      .eq('user_id', userId);

    if (notificationError) {
      console.error("Erro ao atualizar notificação:", notificationError);
    }

    return true;
  } catch (error) {
    console.error("Erro ao aceitar chat:", error);
    return false;
  }
};

export const rejectChatRequest = async (chatId: string, userId: string): Promise<boolean> => {
  try {
    // Deletar o chat e seus participantes (as foreign keys cuidarão dos participantes)
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (deleteError) {
      console.error("Erro ao rejeitar chat:", deleteError);
      return false;
    }

    // Marcar a notificação como lida
    const { error: notificationError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('reference_id', chatId)
      .eq('user_id', userId);

    if (notificationError) {
      console.error("Erro ao atualizar notificação:", notificationError);
    }

    return true;
  } catch (error) {
    console.error("Erro ao rejeitar chat:", error);
    return false;
  }
};
