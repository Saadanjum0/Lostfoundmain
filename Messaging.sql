-- Messaging System Migration for Existing Lost & Found Database
-- This script adds messaging functionality to your current schema

-- First, let's create the missing custom types that your schema references
DO $$ 
BEGIN
    -- Create admin_action_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action_type') THEN
        CREATE TYPE admin_action_type AS ENUM ('ban', 'unban', 'approve', 'reject', 'delete', 'warn', 'suspend');
    END IF;
    
    -- Create item_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_status') THEN
        CREATE TYPE item_status AS ENUM ('pending', 'approved', 'resolved', 'expired', 'rejected');
    END IF;
    
    -- Create user_role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'admin', 'moderator', 'staff');
    END IF;
    
    -- Create notification_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('message', 'item_match', 'item_approved', 'item_expired', 'item_resolved', 'new_message');
    END IF;
END $$;

-- Now let's modify your existing tables to support the new messaging functionality

-- 1. Update the admin_actions table to use the proper type
ALTER TABLE public.admin_actions 
ALTER COLUMN action TYPE admin_action_type USING action::text::admin_action_type;

-- 2. Update the items table to use proper status type
ALTER TABLE public.items 
ALTER COLUMN status TYPE item_status USING status::text::item_status;

-- 3. Update the profiles table to use proper role type
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- 4. Update the notifications table to use proper type
ALTER TABLE public.notifications 
ALTER COLUMN type TYPE notification_type USING type::text::notification_type;

-- 5. Add missing columns to existing tables for better messaging support
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS conversation_type text DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group'));
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_preview text;

-- 6. Add missing columns to messages table for enhanced functionality
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- 7. Create additional tables for enhanced messaging functionality

-- Message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type varchar(50) NOT NULL, -- emoji or reaction identifier
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Message attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name varchar(255) NOT NULL,
    file_url text NOT NULL,
    file_type varchar(100) NOT NULL,
    file_size bigint NOT NULL,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- User relationships table (for blocking/following)
CREATE TABLE IF NOT EXISTS public.user_relationships (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type varchar(20) NOT NULL CHECK (relationship_type IN ('friend', 'blocked', 'following')),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'declined')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, target_user_id, relationship_type)
);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_typing boolean DEFAULT false,
    last_typed_at timestamp with time zone DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

-- Message delivery status table
CREATE TABLE IF NOT EXISTS public.message_delivery_status (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status varchar(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    timestamp timestamp with time zone DEFAULT now(),
    UNIQUE(message_id, recipient_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_item_id ON public.conversations(item_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON public.messages(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_delivery_status_message_id ON public.message_delivery_status(message_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_user_id ON public.user_relationships(user_id);

-- Create or replace functions for messaging functionality

-- Function to update conversation last message info
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Update both direct conversation formats
    UPDATE public.conversations 
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100),
        updated_at = now()
    WHERE (participant_1 = NEW.sender_id AND participant_2 = NEW.receiver_id)
       OR (participant_1 = NEW.receiver_id AND participant_2 = NEW.sender_id)
       OR (id = (SELECT id FROM public.conversations WHERE item_id = NEW.item_id 
                 AND ((participant_1 = NEW.sender_id AND participant_2 = NEW.receiver_id)
                      OR (participant_1 = NEW.receiver_id AND participant_2 = NEW.sender_id))
                 LIMIT 1));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_uuid uuid, user2_uuid uuid, item_uuid uuid DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
    conversation_uuid uuid;
BEGIN
    -- Try to find existing conversation
    SELECT id INTO conversation_uuid
    FROM public.conversations
    WHERE ((participant_1 = user1_uuid AND participant_2 = user2_uuid)
           OR (participant_1 = user2_uuid AND participant_2 = user1_uuid))
    AND (item_id = item_uuid OR (item_id IS NULL AND item_uuid IS NULL))
    AND is_active = true
    LIMIT 1;
    
    -- If no conversation exists, create one
    IF conversation_uuid IS NULL THEN
        INSERT INTO public.conversations (participant_1, participant_2, item_id)
        VALUES (user1_uuid, user2_uuid, item_uuid)
        RETURNING id INTO conversation_uuid;
    END IF;
    
    RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
    unread_count integer;
BEGIN
    SELECT COUNT(*)::integer INTO unread_count
    FROM public.messages
    WHERE receiver_id = user_uuid 
    AND is_read = false
    AND is_deleted = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(user_uuid uuid, other_user_uuid uuid, item_uuid uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
    UPDATE public.messages
    SET is_read = true, read_at = now()
    WHERE receiver_id = user_uuid
    AND sender_id = other_user_uuid
    AND (item_id = item_uuid OR (item_id IS NULL AND item_uuid IS NULL))
    AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation on new message
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON public.messages;
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Enable Row Level Security on new tables
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_delivery_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_reactions.message_id
            AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
        )
    );

CREATE POLICY "Users can add reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions" ON public.message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
            AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
        )
    );

CREATE POLICY "Users can add attachments to their messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
            AND m.sender_id = auth.uid()
        )
    );

-- RLS Policies for user_relationships
CREATE POLICY "Users can view their own relationships" ON public.user_relationships
    FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can manage their own relationships" ON public.user_relationships
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for typing_indicators
CREATE POLICY "Users can view typing in their conversations" ON public.typing_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = typing_indicators.conversation_id
            AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
        )
    );

CREATE POLICY "Users can update their own typing status" ON public.typing_indicators
    FOR ALL USING (user_id = auth.uid());

-- Insert some helpful notification types if they don't exist
INSERT INTO public.notifications (user_id, type, title, message, created_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::uuid,
    'new_message'::notification_type,
    'Messaging System Enabled',
    'Enhanced messaging functionality has been added to your Lost & Found app!',
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.notifications 
    WHERE title = 'Messaging System Enabled'
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Messaging system successfully integrated with your existing schema!';
    RAISE NOTICE '✅ Added Features:';
    RAISE NOTICE '   - Message reactions and attachments';
    RAISE NOTICE '   - User relationships (blocking/following)';
    RAISE NOTICE '   - Typing indicators';
    RAISE NOTICE '   - Message delivery status';
    RAISE NOTICE '   - Enhanced conversation management';
    RAISE NOTICE '📱 Your existing conversations and messages tables are now enhanced!';
END $$;