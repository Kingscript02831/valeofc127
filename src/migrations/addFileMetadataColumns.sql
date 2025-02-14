
-- Add file_metadata columns to all content tables
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS file_metadata jsonb,
ADD COLUMN IF NOT EXISTS files_metadata jsonb[];

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS file_metadata jsonb,
ADD COLUMN IF NOT EXISTS files_metadata jsonb[];

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS file_metadata jsonb,
ADD COLUMN IF NOT EXISTS files_metadata jsonb[];

ALTER TABLE places 
ADD COLUMN IF NOT EXISTS file_metadata jsonb,
ADD COLUMN IF NOT EXISTS files_metadata jsonb[];
