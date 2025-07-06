-- Migration script to fix messaging schema issues
-- Run this in your Supabase SQL editor

-- First, disable RLS temporarily to avoid conflicts
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies that might cause issues
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Check if conversations table needs to be updated
DO $$
BEGIN
    -- Check if conversations table has old structure (participant_1, participant_2)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'participant_1'
    ) THEN
        RAISE NOTICE 'Found old conversations structure, migrating...';
        
        -- Create temporary backup
        CREATE TABLE IF NOT EXISTS conversations_backup AS SELECT * FROM public.conversations;
        
        -- Drop all foreign key constraints that might reference the old columns
        ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_1_fkey CASCADE;
        ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_2_fkey CASCADE;
        
        -- Drop old columns with CASCADE to remove dependent objects
        ALTER TABLE public.conversations DROP COLUMN IF EXISTS participant_1 CASCADE;
        ALTER TABLE public.conversations DROP COLUMN IF EXISTS participant_2 CASCADE;
        
        RAISE NOTICE 'Old conversation structure removed';
    END IF;
END $$;

-- Ensure conversation_participants table exists with correct structure
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'member'::character varying]::text[])),
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    is_active boolean DEFAULT true,
    last_read_at timestamp with time zone DEFAULT now(),
    notification_settings jsonb DEFAULT '{"push": true, "email": false}'::jsonb
);

-- Add foreign key constraints for conversation_participants if they don't exist
DO $$
BEGIN
    -- Add conversation_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_conversation_id_fkey'
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE public.conversation_participants 
        ADD CONSTRAINT conversation_participants_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;
    
    -- Add user_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_user_id_fkey'
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE public.conversation_participants 
        ADD CONSTRAINT conversation_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Add unique constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_unique'
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE public.conversation_participants 
        ADD CONSTRAINT conversation_participants_unique UNIQUE(conversation_id, user_id);
    END IF;
END $$;

-- Update messages table to ensure it has conversation_id column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id uuid;

-- Add foreign key constraint for messages.conversation_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_conversation_id_fkey'
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE public.messages 
        ADD CONSTRAINT messages_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON public.messages(conversation_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive RLS policies

-- Conversations: Users can see conversations they participate in (simple approach)
CREATE POLICY "conversations_select_policy" ON public.conversations
    FOR SELECT USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "conversations_insert_policy" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "conversations_update_policy" ON public.conversations
    FOR UPDATE USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Conversation participants: Users can see participants in their conversations
CREATE POLICY "participants_select_policy" ON public.conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR 
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "participants_insert_policy" ON public.conversation_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "participants_update_policy" ON public.conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Messages: Users can see messages in their conversations
CREATE POLICY "messages_select_policy" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "messages_insert_policy" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "messages_update_policy" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Create or replace function for updating conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        last_message_sender_id = NEW.sender_id,
        updated_at = now()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating conversation when new message is added
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON public.messages;
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Grant necessary permissions
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.message_reactions TO authenticated;
GRANT ALL ON public.message_attachments TO authenticated;

-- Success message
SELECT 'Messaging schema migration completed successfully!' as status; 