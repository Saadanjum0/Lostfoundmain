-- Messaging System Database Schema for Lost & Found App
-- This extends the existing schema with messaging capabilities

-- Conversations table - represents chat threads
CREATE TABLE public.conversations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    type varchar(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    title varchar(255), -- Optional title for group conversations
    item_id uuid REFERENCES public.items(id) ON DELETE SET NULL, -- Link to the item being discussed
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_message_at timestamp with time zone DEFAULT now(),
    last_message_preview text,
    last_message_sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Conversation participants - many-to-many relationship
CREATE TABLE public.conversation_participants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role varchar(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    is_active boolean DEFAULT true,
    last_read_at timestamp with time zone DEFAULT now(),
    notification_settings jsonb DEFAULT '{"push": true, "email": false}',
    UNIQUE(conversation_id, user_id)
);

-- Messages table - individual messages
CREATE TABLE public.messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type varchar(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}' -- For storing additional data like file info, etc.
);

-- Message reactions - emoji reactions to messages
CREATE TABLE public.message_reactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type varchar(50) NOT NULL, -- emoji or reaction identifier
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Message attachments - file uploads linked to messages
CREATE TABLE public.message_attachments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name varchar(255) NOT NULL,
    file_url text NOT NULL,
    file_type varchar(100) NOT NULL,
    file_size bigint NOT NULL,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- User relationships - for blocking/following (optional feature)
CREATE TABLE public.user_relationships (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship_type varchar(20) NOT NULL CHECK (relationship_type IN ('friend', 'blocked', 'following')),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'declined')),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, target_user_id, relationship_type)
);

-- Typing indicators - for real-time typing status
CREATE TABLE public.typing_indicators (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_typing boolean DEFAULT false,
    last_typed_at timestamp with time zone DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

-- Message delivery status - track message delivery and read status
CREATE TABLE public.message_status (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status varchar(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    timestamp timestamp with time zone DEFAULT now(),
    UNIQUE(message_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversations_item_id ON public.conversations(item_id);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id_created_at ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_reply_to_id ON public.messages(reply_to_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX idx_message_status_message_id ON public.message_status(message_id);
CREATE INDEX idx_message_status_user_id ON public.message_status(user_id);

-- Functions for updating timestamps
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
$$ LANGUAGE plpgsql;

-- Trigger for updating conversation when new message is added
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid uuid, conversation_uuid uuid)
RETURNS integer AS $$
DECLARE
    unread_count integer;
    last_read timestamp with time zone;
BEGIN
    -- Get user's last read timestamp for this conversation
    SELECT last_read_at INTO last_read
    FROM public.conversation_participants
    WHERE user_id = user_uuid AND conversation_id = conversation_uuid;
    
    -- Count messages after last read timestamp
    SELECT COUNT(*)::integer INTO unread_count
    FROM public.messages
    WHERE conversation_id = conversation_uuid 
    AND created_at > COALESCE(last_read, '1970-01-01'::timestamp with time zone)
    AND sender_id != user_uuid
    AND deleted_at IS NULL;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for security

-- Conversations: Users can only see conversations they participate in
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants can update conversations" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = conversations.id 
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

-- Conversation participants policies
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.user_id = auth.uid()
            AND cp2.is_active = true
        )
    );

CREATE POLICY "Users can insert themselves as participants" ON public.conversation_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON public.conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Messages policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants 
            WHERE conversation_id = messages.conversation_id 
            AND user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Message reactions policies
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions in their conversations" ON public.message_reactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_participants cp ON m.conversation_id = cp.conversation_id
            WHERE m.id = message_reactions.message_id
            AND cp.user_id = auth.uid()
            AND cp.is_active = true
        )
    );

CREATE POLICY "Users can add reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions" ON public.message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Messaging system schema created successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Run this schema on your database';
    RAISE NOTICE '   2. Implement the React components';
    RAISE NOTICE '   3. Set up real-time subscriptions';
    RAISE NOTICE '✅ Ready for social media-like messaging!';
END $$; 