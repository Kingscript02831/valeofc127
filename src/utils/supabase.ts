
import { supabase } from "@/integrations/supabase/client";

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) return null;
    return session.user;
  } catch (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
}

export async function createOrGetChat(userId: string, recipientId: string) {
  try {
    const chatId = [userId, recipientId].sort().join('_');
    
    // Verificar se o chat já existe
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 significa que não encontrou nenhum resultado (o que é esperado se o chat não existir)
      console.error("Erro ao verificar chat existente:", checkError);
      throw checkError;
    }
    
    if (!existingChat) {
      // Criar novo chat
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert([{ id: chatId }])
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Adicionar participantes
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: chatId, user_id: userId },
          { chat_id: chatId, user_id: recipientId }
        ]);
      
      if (participantsError) throw participantsError;
    }
    
    return chatId;
  } catch (error) {
    console.error("Erro ao criar/obter chat:", error);
    throw error;
  }
}
