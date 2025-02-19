
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

-- Add location_id to profiles table
alter table public.profiles 
add column if not exists location_id uuid references public.locations(id);

-- Function to validate password confirmation
create or replace function check_password_confirmation(
    email text,
    password text,
    password_confirmation text,
    user_metadata jsonb
) returns void as $$
begin
    if password != password_confirmation then
        raise exception 'Password confirmation does not match';
    end if;
end;
$$ language plpgsql security definer;

-- Trigger function to validate password before sign up
create or replace function public.handle_sign_up()
returns trigger as $$
begin
    -- You can add additional validation logic here if needed
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for sign up
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_sign_up();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.locations to anon, authenticated;
grant all on public.profiles to anon, authenticated;

