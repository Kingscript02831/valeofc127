import { supabase } from "@/integrations/supabase/client";

/**
 * Cria um novo chat ou retorna o ID do chat existente entre dois usuários
 */
export const createOrGetChat = async (userId1: string, userId2: string): Promise<string> => {
  try {
    // Criar o ID da sala de chat ordenando os IDs dos usuários
    const chatId = [userId1, userId2].sort().join('_');
    
    // Verificar se o chat já existe
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();
      
    if (checkError && checkError.code !== 'PGSQL_NO_ROWS_RETURNED') {
      console.error("Erro ao verificar chat existente:", checkError);
      throw new Error("Erro ao verificar chat existente");
    }
      
    // Se o chat não existir, criar um novo
    if (!existingChat) {
      console.log("Chat não encontrado, criando novo chat");
      
      // Criar o chat
      const { error: createChatError } = await supabase
        .from('chats')
        .insert({ id: chatId });
        
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
    }
    
    return chatId;
  } catch (error) {
    console.error("Erro ao criar/obter chat:", error);
    throw error;
  }
};
