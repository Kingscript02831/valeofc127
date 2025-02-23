
alter table posts 
add column view_count bigint default 0;

-- Função para incrementar as visualizações
create or replace function increment_view_count()
returns trigger as $$
begin
  update posts
  set view_count = view_count + 1
  where id = new.post_id;
  return new;
end;
$$ language plpgsql;

-- Trigger para incrementar automaticamente as visualizações
create trigger increment_post_views
after insert on post_views
for each row
execute function increment_view_count();

-- Tabela para registrar visualizações únicas
create table post_views (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table post_views enable row level security;

create policy "Public post views are viewable by everyone"
  on post_views for select
  using (true);

create policy "Users can insert their own views"
  on post_views for insert
  with check (true);
