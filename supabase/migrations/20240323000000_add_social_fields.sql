
ALTER TABLE profiles
ADD COLUMN relationship_status text CHECK (relationship_status IN ('single', 'dating', 'widowed')),
ADD COLUMN instagram_url text,
ADD CONSTRAINT valid_instagram_url CHECK (instagram_url IS NULL OR instagram_url ~ '^https?:\/\/');

COMMENT ON COLUMN profiles.relationship_status IS 'User relationship status';
COMMENT ON COLUMN profiles.instagram_url IS 'User Instagram profile URL';
