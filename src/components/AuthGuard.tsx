import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show minimal loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-amber-400 opacity-20"></div>
          </div>
          <p className="mt-3 text-amber-200 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to register with return URL
  if (!user) {
    return (
      <Navigate 
        to={`/auth/register?returnTo=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard; 