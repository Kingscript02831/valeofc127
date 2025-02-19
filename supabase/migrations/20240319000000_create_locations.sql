
-- Create locations table
create table if not exists public.locations (
    id uuid default gen_random_uuid() primary key,
    name varchar not null,
    state varchar not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.locations enable row level security;

-- Create policies
create policy "Allow public read access"
on public.locations
for select
to public
using (true);

create policy "Allow authenticated users to create locations"
on public.locations
for insert
to authenticated
with check (true);

create policy "Allow authenticated users to update their locations"
on public.locations
for update
to authenticated
using (true)
with check (true);

create policy "Allow authenticated users to delete locations"
on public.locations
for delete
to authenticated
using (true);

-- Add location_id to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'location_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN location_id uuid references public.locations(id);
    END IF;
END $$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.locations to anon, authenticated;
grant all on public.profiles to anon, authenticated;
