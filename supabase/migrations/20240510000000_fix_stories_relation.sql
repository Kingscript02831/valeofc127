
-- Add foreign key constraint to stories table to reference profiles
ALTER TABLE IF EXISTS "public"."stories" 
ADD CONSTRAINT "stories_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") 
ON DELETE CASCADE;
