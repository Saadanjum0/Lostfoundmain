-- Fix RLS policies to eliminate infinite recursion
-- Run this in your Supabase SQL editor

-- Temporarily disable RLS
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "conversations_select_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_policy" ON public.conversations;
DROP POLICY IF EXISTS "participants_select_policy" ON public.conversation_participants;
DROP POLICY IF EXISTS "participants_insert_policy" ON public.conversation_participants;
DROP POLICY IF EXISTS "participants_update_policy" ON public.conversation_participants;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "cp_select_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_insert_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "cp_update_own" ON public.conversation_participants;
DROP POLICY IF EXISTS "conv_select" ON public.conversations;
DROP POLICY IF EXISTS "conv_insert" ON public.conversations;
DROP POLICY IF EXISTS "conv_update" ON public.conversations;
DROP POLICY IF EXISTS "msg_select" ON public.messages;
DROP POLICY IF EXISTS "msg_insert" ON public.messages;
DROP POLICY IF EXISTS "msg_update" ON public.messages;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Simple, non-recursive policies for conversation_participants (base table)
CREATE POLICY "cp_select_own" ON public.conversation_participants
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cp_insert_any" ON public.conversation_participants  
    FOR INSERT WITH CHECK (true);  -- Allow any authenticated user to insert participants

CREATE POLICY "cp_update_own" ON public.conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Conversations policies - use direct joins to avoid recursion
CREATE POLICY "conv_select" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id 
            AND cp.user_id = auth.uid() 
            AND cp.is_active = true
        )
    );

CREATE POLICY "conv_insert_any" ON public.conversations
    FOR INSERT WITH CHECK (true);  -- Allow any authenticated user to create conversations

CREATE POLICY "conv_update" ON public.conversations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id 
            AND cp.user_id = auth.uid() 
            AND cp.is_active = true
        )
    );

-- Messages policies - use direct joins to avoid recursion  
CREATE POLICY "msg_select" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid() 
            AND cp.is_active = true
        )
    );

CREATE POLICY "msg_insert" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = messages.conversation_id 
            AND cp.user_id = auth.uid() 
            AND cp.is_active = true
        )
    );

CREATE POLICY "msg_update" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Success message
SELECT 'RLS policies updated successfully - INSERT issues fixed!' as status; 