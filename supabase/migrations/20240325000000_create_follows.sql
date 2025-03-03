
create table follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Criar índices para melhorar a performance das consultas
create index follows_follower_id_idx on follows(follower_id);
create index follows_following_id_idx on follows(following_id);

-- Habilitar RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Enable read access for all users" ON "public"."follows"
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."follows"
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Enable delete for followers" ON "public"."follows"
FOR DELETE USING (auth.uid() = follower_id);

