
CREATE TABLE favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, product_id)
);

-- Adicionar políticas de segurança (RLS)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Permitir usuários autenticados visualizarem seus próprios favoritos
CREATE POLICY "Users can view their own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Permitir usuários autenticados adicionarem favoritos
CREATE POLICY "Users can add favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir usuários autenticados removerem seus próprios favoritos
CREATE POLICY "Users can remove their own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);
