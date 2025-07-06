import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if there's a stored return URL
        const returnTo = localStorage.getItem('auth_return_to') || '/';
        localStorage.removeItem('auth_return_to');
        navigate(returnTo, { replace: true });
      } else {
        // If no user after OAuth, redirect to login
        navigate('/auth/login', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-amber-800">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 