
-- Atualiza o tipo da coluna cover_url
ALTER TABLE profiles 
ALTER COLUMN cover_url TYPE text;

-- Limpa URLs inválidas
UPDATE profiles 
SET cover_url = NULL 
WHERE cover_url IS NOT NULL 
AND cover_url !~ '^https?:\/\/';

-- Adiciona a constraint para validar URLs
ALTER TABLE profiles
ADD CONSTRAINT valid_cover_url 
CHECK (
    cover_url IS NULL OR 
    cover_url ~ '^https?:\/\/'
);

-- Atualiza o comentário da coluna
COMMENT ON COLUMN profiles.cover_url IS 'URL for the user cover image (supports external links)';
