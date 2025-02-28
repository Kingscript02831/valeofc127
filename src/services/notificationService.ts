
import { supabase } from '@/integrations/supabase/client';

// Função para enviar notificação quando um usuário curte um post
export async function sendLikeNotification(postId: string, postOwnerId: string) {
  try {
    // Verifica se o usuário atual é o mesmo que o dono do post
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === postOwnerId) {
      return;
    }

    // Obter informações do post
    const { data: post } = await supabase
      .from('posts')
      .select('content')
      .eq('id', postId)
      .single();

    // Obter informações do usuário que está curtindo
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single();

    if (!currentUserProfile) {
      return;
    }

    // Criar texto truncado do post para a notificação
    const contentPreview = post?.content 
      ? (post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content)
      : 'uma publicação';

    // Inserir notificação
    await supabase.from('notifications').insert({
      title: 'Nova curtida',
      message: `${currentUserProfile.full_name} curtiu sua publicação "${contentPreview}"`,
      type: 'system',
      reference_id: postId,
      user_id: postOwnerId,
      read: false,
      publication_title: contentPreview,
      sender: {
        id: user.id,
        username: currentUserProfile.username,
        full_name: currentUserProfile.full_name,
        avatar_url: ''
      }
    });

  } catch (error) {
    console.error('Erro ao enviar notificação de curtida:', error);
  }
}

// Função para enviar notificação quando um usuário comenta em um post
export async function sendCommentNotification(postId: string, postOwnerId: string, commentContent: string) {
  try {
    // Verifica se o usuário atual é o mesmo que o dono do post
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === postOwnerId) {
      return;
    }

    // Obter informações do post
    const { data: post } = await supabase
      .from('posts')
      .select('content')
      .eq('id', postId)
      .single();

    // Obter informações do usuário que está comentando
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single();

    if (!currentUserProfile) {
      return;
    }

    // Criar texto truncado do post e do comentário para a notificação
    const contentPreview = post?.content 
      ? (post.content.length > 30 ? post.content.substring(0, 30) + '...' : post.content)
      : 'uma publicação';
    
    const commentPreview = commentContent.length > 30 
      ? commentContent.substring(0, 30) + '...' 
      : commentContent;

    // Inserir notificação
    await supabase.from('notifications').insert({
      title: 'Novo comentário',
      message: `${currentUserProfile.full_name} comentou em sua publicação: "${commentPreview}"`,
      type: 'system',
      reference_id: postId,
      user_id: postOwnerId,
      read: false,
      publication_title: contentPreview,
      publication_description: commentPreview,
      sender: {
        id: user.id,
        username: currentUserProfile.username,
        full_name: currentUserProfile.full_name,
        avatar_url: ''
      }
    });

  } catch (error) {
    console.error('Erro ao enviar notificação de comentário:', error);
  }
}
