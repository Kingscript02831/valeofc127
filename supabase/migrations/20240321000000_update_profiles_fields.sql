
-- Mantém os campos existentes mas atualiza seus tipos
ALTER TABLE profiles
ALTER COLUMN avatar_url TYPE text,
ALTER COLUMN cover_url TYPE text;

-- Atualiza o schema cache
COMMENT ON TABLE profiles IS 'Profile data for each user';
COMMENT ON COLUMN profiles.avatar_url IS 'URL for the user profile picture';
COMMENT ON COLUMN profiles.cover_url IS 'URL for the user cover image';
