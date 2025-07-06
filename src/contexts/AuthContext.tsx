import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile } from '@/lib/supabase'
import { Profile } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: Partial<Profile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const userProfile = await getUserProfile(session.user.id)
            setProfile(userProfile)
          } catch (error) {
            console.error('Error fetching profile:', error)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session?.user);
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch profile in background with timeout
          const fetchProfile = async () => {
            try {
              console.log('Fetching profile for user:', session.user.id);
              
              const profilePromise = getUserProfile(session.user.id);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
              );
              
              const userProfile = await Promise.race([profilePromise, timeoutPromise]) as any;
              console.log('Profile fetched:', !!userProfile);
              setProfile(userProfile)
            } catch (error) {
              console.error('Error fetching profile:', error)
              setProfile(null)
              
              // If profile doesn't exist yet (new user), try once more after a delay
              if (event === 'SIGNED_IN') {
                setTimeout(async () => {
                  try {
                    console.log('Retrying profile fetch for new user...');
                    const userProfile = await getUserProfile(session.user.id);
                    console.log('Retry profile fetch result:', !!userProfile);
                    setProfile(userProfile);
                  } catch (retryError) {
                    console.error('Retry profile fetch failed:', retryError);
                  }
                }, 1500);
              }
            }
          };
          
          // Execute profile fetch without blocking
          fetchProfile();
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      console.log('Starting signUp...');
      
      const signupData = {
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
            student_id: userData.student_id || null,
            department: userData.department || null,
            year_of_study: userData.year_of_study || null,
            phone_number: userData.phone_number || null,
          }
        }
      };
      
      console.log('Calling supabase.auth.signUp with data:', {
        email: signupData.email,
        hasPassword: !!signupData.password,
        metadata: signupData.options.data
      });
      
      const startTime = Date.now();
      
      // Reduced timeout for faster UX
      const signUpPromise = supabase.auth.signUp(signupData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Registration timeout - please try again')), 8000)
      );

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;
      
      const endTime = Date.now();
      console.log(`SignUp completed in ${endTime - startTime}ms`);

      console.log('SignUp response received:', { 
        hasData: !!data, 
        hasError: !!error,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        needsConfirmation: data?.user && !data.user.email_confirmed_at
      });

      if (error) {
        console.error('SignUp error details:', error);
        throw error;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        console.log('Email confirmed:', !!data.user.email_confirmed_at);
      }

      return data;
    } catch (error: any) {
      console.error('SignUp failed:', error.message);
      console.error('Error details:', error);
      throw error;
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error: any) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
    } catch (error: any) {
      throw error
    }
  }

  const refreshProfile = async () => {
    try {
      if (!user) return

      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    updateProfile,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 