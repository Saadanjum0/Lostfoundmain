-- Minimal Enhanced Messaging Functions
-- These are the essential functions for the messaging system to work properly

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
             AND m.sender_id != user_uuid), 
            0
        ) as count
    FROM public.conversations c
    JOIN public.conversation_participants cp ON cp.conversation_id = c.id
    WHERE c.id = ANY(conversation_uuids)
    AND cp.user_id = user_uuid
    AND cp.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to search messages in a conversation
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
    sender_avatar text
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
        p.avatar_url as sender_avatar
    FROM public.messages m
    JOIN public.profiles p ON p.id = m.sender_id
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.conversation_id = conversation_uuid
    AND cp.user_id = user_uuid
    AND cp.is_active = true
    AND LOWER(m.content) LIKE LOWER('%' || search_query || '%')
    ORDER BY m.created_at DESC
    LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_multiple_unread_counts(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION search_messages_in_conversation(text, uuid, uuid, integer) TO authenticated;
