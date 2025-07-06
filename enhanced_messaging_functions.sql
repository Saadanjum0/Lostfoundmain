-- Enhanced Messaging System Functions
-- These functions support the Instagram-like messaging interface

-- Function to get multiple unread counts efficiently (batch operation)
CREATE OR REPLACE FUNCTION get_multiple_unread_counts(user_uuid uuid, conversation_uuids uuid[])
RETURNS TABLE(conversation_id uuid, count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        COALESCE(
            (SELECT COUNT(*)
             FROM public.messages m
             WHERE m.conversation_id = c.id 
             AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamp with time zone)
             AND m.sender_id != user_uuid
             AND m.deleted_at IS NULL), 
            0
        ) as count
    FROM public.conversations c
    JOIN public.conversation_participants cp ON cp.conversation_id = c.id
    WHERE c.id = ANY(conversation_uuids)
    AND cp.user_id = user_uuid
    AND cp.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to search messages with full-text search
CREATE OR REPLACE FUNCTION search_messages_in_conversation(
    search_query text,
    conversation_uuid uuid,
    user_uuid uuid,
    search_limit integer DEFAULT 20
)
RETURNS TABLE(
    id uuid,
    conversation_id uuid,
    sender_id uuid,
    content text,
    message_type varchar(20),
    created_at timestamp with time zone,
    sender_name text,
    sender_avatar text,
    rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.created_at,
        p.full_name as sender_name,
        p.avatar_url as sender_avatar,
        ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_query)) as rank
    FROM public.messages m
    JOIN public.profiles p ON p.id = m.sender_id
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.conversation_id = conversation_uuid
    AND cp.user_id = user_uuid
    AND cp.is_active = true
    AND m.deleted_at IS NULL
    AND to_tsvector('english', m.content) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, m.created_at DESC
    LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation summary with participants and last activity
CREATE OR REPLACE FUNCTION get_conversation_summary(conversation_uuid uuid, user_uuid uuid)
RETURNS TABLE(
    id uuid,
    type varchar(20),
    title varchar(255),
    participant_count bigint,
    last_message_at timestamp with time zone,
    last_message_preview text,
    unread_count bigint,
    is_online boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.title,
        (SELECT COUNT(*) FROM public.conversation_participants WHERE conversation_id = c.id AND is_active = true) as participant_count,
        c.last_message_at,
        c.last_message_preview,
        COALESCE(
            (SELECT COUNT(*)
             FROM public.messages m
             JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
             WHERE m.conversation_id = c.id 
             AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01'::timestamp with time zone)
             AND m.sender_id != user_uuid
             AND m.deleted_at IS NULL
             AND cp.user_id = user_uuid), 
            0
        ) as unread_count,
        CASE 
            WHEN c.type = 'direct' THEN 
                (SELECT p.is_online 
                 FROM public.conversation_participants cp
                 JOIN public.profiles p ON p.id = cp.user_id
                 WHERE cp.conversation_id = c.id 
                 AND cp.user_id != user_uuid 
                 AND cp.is_active = true
                 LIMIT 1)
            ELSE false
        END as is_online
    FROM public.conversations c
    JOIN public.conversation_participants my_participation ON my_participation.conversation_id = c.id
    WHERE c.id = conversation_uuid
    AND my_participation.user_id = user_uuid
    AND my_participation.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_user_online_status(user_uuid uuid, online_status boolean)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        is_online = online_status,
        last_seen = CASE WHEN online_status = false THEN now() ELSE last_seen END
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
    UPDATE public.typing_indicators 
    SET is_typing = false
    WHERE is_typing = true 
    AND last_typed_at < now() - interval '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to get active typing users in a conversation
CREATE OR REPLACE FUNCTION get_typing_users(conversation_uuid uuid, exclude_user_uuid uuid)
RETURNS TABLE(
    user_id uuid,
    full_name text,
    avatar_url text,
    last_typed_at timestamp with time zone
) AS $$
BEGIN
    -- Clean up old typing indicators first
    PERFORM cleanup_old_typing_indicators();
    
    RETURN QUERY
    SELECT 
        ti.user_id,
        p.full_name,
        p.avatar_url,
        ti.last_typed_at
    FROM public.typing_indicators ti
    JOIN public.profiles p ON p.id = ti.user_id
    WHERE ti.conversation_id = conversation_uuid
    AND ti.is_typing = true
    AND ti.user_id != exclude_user_uuid
    AND ti.last_typed_at > now() - interval '5 seconds'
    ORDER BY ti.last_typed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation participants with online status
CREATE OR REPLACE FUNCTION get_conversation_participants_with_status(conversation_uuid uuid)
RETURNS TABLE(
    user_id uuid,
    full_name text,
    avatar_url text,
    email text,
    is_online boolean,
    last_seen timestamp with time zone,
    role varchar(20),
    joined_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.user_id,
        p.full_name,
        p.avatar_url,
        p.email,
        p.is_online,
        p.last_seen,
        cp.role,
        cp.joined_at
    FROM public.conversation_participants cp
    JOIN public.profiles p ON p.id = cp.user_id
    WHERE cp.conversation_id = conversation_uuid
    AND cp.is_active = true
    ORDER BY cp.joined_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to mark conversation as read and return affected message IDs
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_uuid uuid, user_uuid uuid)
RETURNS TABLE(message_id uuid) AS $$
DECLARE
    read_timestamp timestamp with time zone := now();
BEGIN
    -- Update the participant's last_read_at timestamp
    UPDATE public.conversation_participants 
    SET last_read_at = read_timestamp
    WHERE conversation_id = conversation_uuid 
    AND user_id = user_uuid;
    
    -- Return the IDs of messages that were marked as read
    RETURN QUERY
    SELECT m.id as message_id
    FROM public.messages m
    WHERE m.conversation_id = conversation_uuid
    AND m.sender_id != user_uuid
    AND m.created_at <= read_timestamp
    AND m.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON public.messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON public.profiles(is_online, last_seen);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_active ON public.typing_indicators(conversation_id, is_typing, last_typed_at) WHERE is_typing = true;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_multiple_unread_counts(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION search_messages_in_conversation(text, uuid, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_summary(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_online_status(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_typing_indicators() TO authenticated;
GRANT EXECUTE ON FUNCTION get_typing_users(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_participants_with_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_as_read(uuid, uuid) TO authenticated; 