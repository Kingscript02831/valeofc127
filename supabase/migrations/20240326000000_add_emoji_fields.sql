
alter table site_configuration
add column if not exists like_emoji text,
add column if not exists love_emoji text,
add column if not exists haha_emoji text,
add column if not exists sad_emoji text,
add column if not exists angry_emoji text;
