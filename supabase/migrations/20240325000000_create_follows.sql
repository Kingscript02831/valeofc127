
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
