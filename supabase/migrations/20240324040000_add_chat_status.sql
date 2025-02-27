
-- Adicionar coluna de status na tabela chats
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('pending', 'active')),
ADD COLUMN IF NOT EXISTS initiator_id UUID REFERENCES auth.users(id);

-- Adicionar coluna de metadata na tabela notifications para dados extras
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Atualizar chats existentes para status ativo
UPDATE chats SET status = 'active' WHERE status IS NULL;

-- Tornar status NOT NULL após a atualização
ALTER TABLE chats 
ALTER COLUMN status SET NOT NULL;

-- Adicionar políticas de segurança para garantir que os usuários possam acessar chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
DROP POLICY IF EXISTS "Usuários podem ver chats dos quais participam" ON chats;
CREATE POLICY "Usuários podem ver chats dos quais participam" ON chats
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM chat_participants
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem criar chats" ON chats;
CREATE POLICY "Usuários podem criar chats" ON chats
    FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar chats" ON chats;
CREATE POLICY "Usuários podem atualizar chats" ON chats
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM chat_participants
            WHERE chat_id = id AND user_id = auth.uid()
        )
    );

-- Políticas para chat_participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver participantes dos seus chats" ON chat_participants;
CREATE POLICY "Usuários podem ver participantes dos seus chats" ON chat_participants
    FOR SELECT 
    USING (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem adicionar participantes aos seus chats" ON chat_participants;
CREATE POLICY "Usuários podem adicionar participantes aos seus chats" ON chat_participants
    FOR INSERT 
    WITH CHECK (
        chat_id IN (
            SELECT id FROM chats 
            WHERE initiator_id = auth.uid()
        ) OR 
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

-- Políticas para mensagens
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver mensagens dos seus chats" ON messages;
CREATE POLICY "Usuários podem ver mensagens dos seus chats" ON messages
    FOR SELECT 
    USING (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Usuários podem enviar mensagens em seus chats" ON messages;
CREATE POLICY "Usuários podem enviar mensagens em seus chats" ON messages
    FOR INSERT 
    WITH CHECK (
        chat_id IN (
            SELECT chat_id FROM chat_participants WHERE user_id = auth.uid()
        ) AND sender_id = auth.uid()
    );

DROP POLICY IF EXISTS "Usuários podem excluir suas próprias mensagens" ON messages;
CREATE POLICY "Usuários podem excluir suas próprias mensagens" ON messages
    FOR DELETE
    USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias mensagens" ON messages;
CREATE POLICY "Usuários podem atualizar suas próprias mensagens" ON messages
    FOR UPDATE
    USING (sender_id = auth.uid());
