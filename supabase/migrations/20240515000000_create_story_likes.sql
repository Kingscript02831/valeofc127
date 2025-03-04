
-- Tabela para curtidas em histórias
create table if not exists public.story_likes (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(story_id, user_id)
);

-- Habilitar Row Level Security
alter table public.story_likes enable row level security;

-- Políticas RLS
create policy "Story likes são visíveis para todos"
  on story_likes for select
  using (true);

create policy "Usuários podem inserir suas próprias curtidas"
  on story_likes for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem remover suas próprias curtidas"
  on story_likes for delete
  using (auth.uid() = user_id);
