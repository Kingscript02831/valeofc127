
ALTER TABLE public.profiles
ADD COLUMN relationship_status text CHECK (relationship_status IN ('single', 'dating', 'widowed')),
ADD COLUMN instagram_url text;

COMMENT ON COLUMN public.profiles.relationship_status IS 'User relationship status';
COMMENT ON COLUMN public.profiles.instagram_url IS 'Instagram profile URL';
