-- Fix missing foreign key constraint for reply_to_id in messages table
-- This will resolve the "Could not find a relationship between 'messages' and 'messages'" error

-- First, check if the constraint already exists and drop it if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_reply_to_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE messages DROP CONSTRAINT messages_reply_to_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint for reply_to_id
-- This creates a self-referencing relationship within the messages table
ALTER TABLE messages 
ADD CONSTRAINT messages_reply_to_id_fkey 
FOREIGN KEY (reply_to_id) 
REFERENCES messages(id) 
ON DELETE CASCADE;

-- Create an index for better performance on reply_to_id lookups
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);

-- Refresh the schema cache in PostgREST (Supabase's API layer)
-- This is done automatically but we can trigger it explicitly
NOTIFY pgrst, 'reload schema';

-- Verify the constraint was created
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'messages'
    AND tc.constraint_name = 'messages_reply_to_id_fkey'; 