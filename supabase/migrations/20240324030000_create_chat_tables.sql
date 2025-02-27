
-- Criar tabela de chats
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Criar tabela de participantes do chat
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(chat_id, user_id)
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    read BOOLEAN DEFAULT false
);

-- Adicionar políticas de segurança RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Usuários podem ver chats dos quais participam" ON chats
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM chat_participants
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem criar chats" ON chats
    FOR INSERT 
    WITH CHECK (true);

-- Políticas para participantes
CREATE POLICY "Usuários podem ver participantes dos seus chats" ON chat_participants
    FOR SELECT 
    USING (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem adicionar participantes aos seus chats" ON chat_participants
    FOR INSERT 
    WITH CHECK (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

-- Políticas para mensagens
CREATE POLICY "Usuários podem ver mensagens dos seus chats" ON messages
    FOR SELECT 
    USING (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem enviar mensagens em seus chats" ON messages
    FOR INSERT 
    WITH CHECK (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        ) AND sender_id = auth.uid()
    );

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Adicionar função para atualizar o timestamp do chat
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o timestamp do chat quando uma nova mensagem é enviada
CREATE TRIGGER update_chat_timestamp_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_timestamp();
