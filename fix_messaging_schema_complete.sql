-- Complete fix for messaging system schema issues
-- Fixes: 1) receiver_id NOT NULL constraint, 2) typing indicators conflicts

-- Fix 1: Make receiver_id nullable in messages table
-- In conversation-based messaging, receiver_id is not needed since messages go to all conversation participants
ALTER TABLE messages ALTER COLUMN receiver_id DROP NOT NULL;

-- Fix 2: Add unique constraint to typing_indicators to prevent conflicts
-- Drop existing typing indicators to avoid conflicts
DELETE FROM typing_indicators;

-- Add unique constraint to prevent duplicate typing indicators per user/conversation
ALTER TABLE typing_indicators 
ADD CONSTRAINT typing_indicators_user_conversation_unique 
UNIQUE (conversation_id, user_id);

-- Fix 3: Update message sending function to handle receiver_id properly
-- For conversation messages, we'll set receiver_id to NULL or the first other participant
CREATE OR REPLACE FUNCTION set_receiver_id_for_conversation_message()
RETURNS TRIGGER AS $$
BEGIN
    -- If receiver_id is not set and we have a conversation_id, set it to the first other participant
    IF NEW.receiver_id IS NULL AND NEW.conversation_id IS NOT NULL THEN
        SELECT user_id INTO NEW.receiver_id
        FROM conversation_participants
        WHERE conversation_id = NEW.conversation_id
          AND user_id != NEW.sender_id
          AND is_active = true
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set receiver_id
DROP TRIGGER IF EXISTS set_receiver_id_trigger ON messages;
CREATE TRIGGER set_receiver_id_trigger
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_receiver_id_for_conversation_message();

-- Fix 4: Add missing foreign key constraint for reply_to_id (if not exists)
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_reply_to_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        -- Add the foreign key constraint for reply_to_id
        ALTER TABLE messages 
        ADD CONSTRAINT messages_reply_to_id_fkey 
        FOREIGN KEY (reply_to_id) 
        REFERENCES messages(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_user ON typing_indicators(conversation_id, user_id);

-- Fix 6: Clean up any existing invalid data
-- Update any existing messages with null receiver_id
UPDATE messages 
SET receiver_id = (
    SELECT user_id 
    FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id 
      AND user_id != messages.sender_id 
      AND is_active = true 
    LIMIT 1
)
WHERE receiver_id IS NULL AND conversation_id IS NOT NULL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the changes
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'messages' 
  AND column_name IN ('receiver_id', 'conversation_id', 'reply_to_id');

SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'typing_indicators' 
  AND constraint_type = 'UNIQUE'; 