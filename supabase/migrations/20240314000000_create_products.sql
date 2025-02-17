
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    condition TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    user_id UUID NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_urls TEXT[] DEFAULT '{}'::TEXT[],
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Adicionar políticas de RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de produtos" ON products
    FOR SELECT USING (true);

-- Política para permitir inserção pelo próprio usuário
CREATE POLICY "Usuários podem inserir seus próprios produtos" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir atualização pelo próprio usuário
CREATE POLICY "Usuários podem atualizar seus próprios produtos" ON products
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir deleção pelo próprio usuário
CREATE POLICY "Usuários podem deletar seus próprios produtos" ON products
    FOR DELETE USING (auth.uid() = user_id);
