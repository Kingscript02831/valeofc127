
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    product_id UUID REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- Adicionar políticas de RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura dos próprios favoritos
CREATE POLICY "Usuários podem ver seus próprios favoritos" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir inserção dos próprios favoritos
CREATE POLICY "Usuários podem adicionar seus próprios favoritos" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir deleção dos próprios favoritos
CREATE POLICY "Usuários podem remover seus próprios favoritos" ON favorites
    FOR DELETE USING (auth.uid() = user_id);
