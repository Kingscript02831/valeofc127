
create table if not exists public.comment_likes (
  id uuid default uuid_generate_v4() primary key,
  comment_id uuid references public.post_comments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(comment_id, user_id)
);

-- Enable RLS
alter table public.comment_likes enable row level security;

-- Policies
create policy "Users can view comment likes"
  on public.comment_likes
  for select
  using (true);

create policy "Users can insert their own likes"
  on public.comment_likes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.comment_likes
  for delete
  using (auth.uid() = user_id);
