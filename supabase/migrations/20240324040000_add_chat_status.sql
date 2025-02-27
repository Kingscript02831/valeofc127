
-- Adicionar coluna de status na tabela chats
ALTER TABLE chats 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
ADD COLUMN initiator_id UUID REFERENCES auth.users(id);

-- Adicionar coluna de metadata na tabela notifications para dados extras
ALTER TABLE notifications
ADD COLUMN metadata JSONB DEFAULT NULL;

-- Atualizar chats existentes para status ativo
UPDATE chats SET status = 'active' WHERE status IS NULL;

-- Tornar status NOT NULL após a atualização
ALTER TABLE chats 
ALTER COLUMN status SET NOT NULL;
