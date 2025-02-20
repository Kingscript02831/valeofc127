
-- Primeiro, atualiza o tipo da coluna
ALTER TABLE profiles 
ALTER COLUMN cover_url TYPE text;

-- Limpa URLs inválidas
UPDATE profiles 
SET cover_url = NULL 
WHERE cover_url IS NOT NULL 
AND cover_url !~ '^https?:\/\/';

-- Agora adiciona a constraint
ALTER TABLE profiles
ADD CONSTRAINT valid_cover_url 
CHECK (
    cover_url IS NULL OR 
    cover_url ~ '^https?:\/\/'
);

-- Atualiza o comentário da coluna
COMMENT ON COLUMN profiles.cover_url IS 'URL for the user cover image (supports DropBox links)';
