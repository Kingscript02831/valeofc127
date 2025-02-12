
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { otherUserId } = await req.json()
    const userId = (await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split(' ')[1])).data.user?.id

    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verificar se já existe um chat entre estes usuários
    const { data: existingChat } = await supabaseClient
      .from('chats')
      .select('id, participants!chat_participants(user_id)')
      .eq('participants.user_id', userId)
      .contains('participants.user_id', [otherUserId])
      .single()

    if (existingChat) {
      return new Response(
        JSON.stringify({ id: existingChat.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Criar novo chat
    const { data: newChat, error: chatError } = await supabaseClient
      .from('chats')
      .insert({})
      .select()
      .single()

    if (chatError) throw chatError

    // Adicionar participantes
    const { error: participantsError } = await supabaseClient
      .from('chat_participants')
      .insert([
        { chat_id: newChat.id, user_id: userId },
        { chat_id: newChat.id, user_id: otherUserId }
      ])

    if (participantsError) throw participantsError

    return new Response(
      JSON.stringify({ id: newChat.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
