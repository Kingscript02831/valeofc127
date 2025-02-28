
-- Adicionar campo de cidade à tabela posts (se não existir)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS city text;

-- Adicionar campo de localização geográfica como jsonb (se não existir)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location jsonb;

-- Atualizar posts existentes com informações de cidade do perfil do usuário
UPDATE posts p
SET city = pr.city
FROM profiles pr
WHERE p.user_id = pr.id AND p.city IS NULL;

-- Tentativa de converter location do tipo geography para jsonb
-- Usamos ST_AsGeoJSON para converter geography para formato JSON compatível
UPDATE posts p
SET location = jsonb_build_object(
  'lat', ST_Y(ST_AsText(pr.location::geometry)::geometry),
  'lng', ST_X(ST_AsText(pr.location::geometry)::geometry)
)
FROM profiles pr
WHERE p.user_id = pr.id 
  AND p.location IS NULL 
  AND pr.location IS NOT NULL;

-- Adicionar índice para melhorar performance de buscas por localização
CREATE INDEX IF NOT EXISTS idx_posts_city ON posts(city);
