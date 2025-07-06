-- Add missing columns to profiles table for online status tracking
-- Run this script first before running enhanced_messaging_functions.sql

-- Add online status tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Update existing users to be offline initially
UPDATE public.profiles 
SET is_online = false, last_seen = now() 
WHERE is_online IS NULL OR last_seen IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_online_status ON public.profiles(is_online, last_seen);

-- Grant necessary permissions
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Now you can run the enhanced_messaging_functions.sql script 