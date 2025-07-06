/**
 * Configuration for the Lost & Found application
 * 
 * Required Environment Variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * Create a .env.local file in the root directory with these variables:
 * 
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_ANON_KEY=your_anon_key_here
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name: 'FCCU Lost & Found',
    description: 'Campus Lost and Found Management System',
    version: '1.0.0',
  },
  features: {
    googleAuth: true,
    emailVerification: true,
    realTimeNotifications: true,
    fileUpload: true,
    searchWithFilters: true,
  },
} as const

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
)

if (missingEnvVars.length > 0) {
  console.error(
    'Missing required environment variables:',
    missingEnvVars.join(', ')
  )
  console.error(
    'Please create a .env.local file with the required variables.'
  )
} 