
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  images text[] default '{}',
  video_urls text[] default '{}',
  likes integer default 0,
  location_id uuid references locations(id),
  location_name text,
  latitude double precision,
  longitude double precision,
  view_count bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table post_likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  reaction_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

create table post_comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  content text not null,
  reply_to_id uuid references post_comments(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table post_views (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id),
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table posts enable row level security;
alter table post_likes enable row level security;
alter table post_comments enable row level security;
alter table post_views enable row level security;

-- Posts policies
create policy "Public posts are viewable by everyone"
  on posts for select
  using (true);

create policy "Users can insert their own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone"
  on post_likes for select
  using (true);

create policy "Users can insert their own likes"
  on post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on post_likes for delete
  using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone"
  on post_comments for select
  using (true);

create policy "Users can insert their own comments"
  on post_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on post_comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on post_comments for delete
  using (auth.uid() = user_id);

-- Views policies
create policy "Views are viewable by everyone"
  on post_views for select
  using (true);

create policy "Anyone can insert views"
  on post_views for insert
  with check (true);
