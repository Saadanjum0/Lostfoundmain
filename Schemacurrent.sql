-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL,
  action USER-DEFINED NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_actions_pkey PRIMARY KEY (id),
  CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversation_participants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'member'::character varying]::text[])),
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  is_active boolean DEFAULT true,
  last_read_at timestamp with time zone DEFAULT now(),
  notification_settings jsonb DEFAULT '{"push": true, "email": false}'::jsonb,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_id uuid,
  last_message_id uuid,
  last_message_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  type character varying DEFAULT 'direct'::character varying CHECK (type::text = ANY (ARRAY['direct'::character varying, 'group'::character varying]::text[])),
  title character varying,
  last_message_preview text,
  last_message_sender_id uuid,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_last_message_sender_id_fkey FOREIGN KEY (last_message_sender_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_last_message_id_fkey FOREIGN KEY (last_message_id) REFERENCES public.messages(id),
  CONSTRAINT conversations_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.conversations_backup (
  id uuid,
  participant_1 uuid,
  participant_2 uuid,
  item_id uuid,
  last_message_id uuid,
  last_message_at timestamp with time zone,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  type character varying,
  title character varying,
  last_message_preview text,
  last_message_sender_id uuid
);
CREATE TABLE public.item_views (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL,
  user_id uuid,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT item_views_pkey PRIMARY KEY (id),
  CONSTRAINT item_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT item_views_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['lost'::text, 'found'::text])),
  category text,
  location text,
  specific_location text,
  date_lost_found date NOT NULL,
  time_lost_found time without time zone,
  images ARRAY,
  tags ARRAY,
  status USER-DEFINED DEFAULT 'pending'::item_status,
  reward_offered numeric DEFAULT 0,
  contact_phone text,
  contact_email text,
  is_urgent boolean DEFAULT false,
  views_count integer DEFAULT 0,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  admin_notes text,
  rejection_reason text,
  expires_at timestamp with time zone DEFAULT (now() + '90 days'::interval),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT items_pkey PRIMARY KEY (id),
  CONSTRAINT items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT items_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  building text,
  floor text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  file_name character varying NOT NULL,
  file_url text NOT NULL,
  file_type character varying NOT NULL,
  file_size bigint NOT NULL,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id)
);
CREATE TABLE public.message_reactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reaction_type character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id)
);
CREATE TABLE public.message_status (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status character varying DEFAULT 'sent'::character varying CHECK (status::text = ANY (ARRAY['sent'::character varying, 'delivered'::character varying, 'read'::character varying]::text[])),
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT message_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL,
  receiver_id uuid,
  item_id uuid,
  content text NOT NULL,
  images ARRAY,
  message_type text DEFAULT 'text'::text CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'system'::text])),
  is_read boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  reply_to uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  conversation_id uuid,
  reply_to_id uuid,
  edited_at timestamp with time zone,
  deleted_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id),
  CONSTRAINT messages_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.messages(id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  item_id uuid,
  sender_id uuid,
  action_url text,
  expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  phone_number text,
  student_id text UNIQUE,
  department text,
  year_of_study integer,
  role USER-DEFINED DEFAULT 'student'::user_role,
  is_banned boolean DEFAULT false,
  ban_reason text,
  email_verified boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{"sms": false, "push": true, "email": true}'::jsonb,
  privacy_settings jsonb DEFAULT '{"show_email": true, "show_phone": false}'::jsonb,
  last_active timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_online boolean DEFAULT false,
  last_seen timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid,
  reported_item_id uuid,
  reported_message_id uuid,
  report_type text NOT NULL CHECK (report_type = ANY (ARRAY['spam'::text, 'inappropriate'::text, 'fake'::text, 'harassment'::text, 'other'::text])),
  reason text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text, 'dismissed'::text])),
  admin_notes text,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reported_message_id_fkey FOREIGN KEY (reported_message_id) REFERENCES public.messages(id),
  CONSTRAINT reports_reported_item_id_fkey FOREIGN KEY (reported_item_id) REFERENCES public.items(id)
);
CREATE TABLE public.saved_searches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  search_params jsonb NOT NULL,
  is_active boolean DEFAULT true,
  email_alerts boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_searches_pkey PRIMARY KEY (id),
  CONSTRAINT saved_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.typing_indicators (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_typing boolean DEFAULT false,
  last_typed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT typing_indicators_pkey PRIMARY KEY (id),
  CONSTRAINT typing_indicators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT typing_indicators_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.user_relationships (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  relationship_type character varying NOT NULL CHECK (relationship_type::text = ANY (ARRAY['friend'::character varying, 'blocked'::character varying, 'following'::character varying]::text[])),
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'pending'::character varying, 'declined'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_relationships_pkey PRIMARY KEY (id),
  CONSTRAINT user_relationships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_relationships_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.profiles(id)
);