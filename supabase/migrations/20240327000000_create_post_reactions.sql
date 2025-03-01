
-- Create a table for post reactions with different emoji types
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view post reactions"
  ON public.post_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reactions"
  ON public.post_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON public.post_reactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.post_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to count reactions by type
CREATE OR REPLACE FUNCTION public.count_reactions_by_type(post_id_param uuid, reaction_type_param text)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.post_reactions
    WHERE post_id = post_id_param AND reaction_type = reaction_type_param
  );
END;
$$;

-- Create function to check if user has reacted
CREATE OR REPLACE FUNCTION public.has_user_reacted(post_id_param uuid, user_id_param uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  reaction text;
BEGIN
  SELECT reaction_type INTO reaction
  FROM public.post_reactions
  WHERE post_id = post_id_param AND user_id = user_id_param;
  
  RETURN reaction;
END;
$$;
