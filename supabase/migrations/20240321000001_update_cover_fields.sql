
-- Garante que a coluna cover_url existe e é do tipo text
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cover_url text;

-- Atualiza os comentários da tabela
COMMENT ON COLUMN profiles.cover_url IS 'URL for the user cover image';
