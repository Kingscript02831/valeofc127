
-- Mantém os campos existentes e atualiza o schema
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark',
ALTER COLUMN avatar_url TYPE text,
ALTER COLUMN cover_url TYPE text;

-- Atualiza o schema cache com comentários para todos os campos
COMMENT ON TABLE profiles IS 'Profile data for each user';
COMMENT ON COLUMN profiles.avatar_url IS 'URL for the user profile picture';
COMMENT ON COLUMN profiles.cover_url IS 'URL for the user cover image';
COMMENT ON COLUMN profiles.status IS 'User status message';
COMMENT ON COLUMN profiles.theme_preference IS 'User theme preference';

