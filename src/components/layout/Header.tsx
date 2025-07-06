import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  User, 
  Settings, 
  LogOut, 
  Search,
  ChevronDown,
  Sparkles,
  Shield
} from 'lucide-react';
import { MessagingButton } from '../messaging/MessagingButton';
import SplitText from '../ui/SplitText';

export default function Header() {
  const { user, profile, signOut, loading, refreshProfile } = useAuth();

  // Debug logging (uncomment if needed for troubleshooting)
  // console.log('Header Debug Info:', {
  //   hasUser: !!user,
  //   userEmail: user?.email,
  //   hasProfile: !!profile,
  //   profileRole: profile?.role,
  //   isAdmin: profile?.role === 'admin' || profile?.role === 'super_admin'
  // });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Lost & Found
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/items/browse" 
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
            >
              Browse Items
            </Link>
            {user && (
              <Link 
                to="/messages" 
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
              >
                Messages
              </Link>
            )}
            <Link 
              to="/report/lost" 
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
            >
              Report Lost
            </Link>
            <Link 
              to="/report/found" 
              className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
            >
              Report Found
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="hidden sm:block w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {/* Messaging Button */}
                <MessagingButton />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-200 group"
                    >
                      <Avatar className="w-8 h-8 ring-2 ring-gray-200 group-hover:ring-amber-400 transition-all duration-200">
                        <AvatarImage src={profile?.avatar_url} alt={getUserDisplayName()} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-sm">
                          {getInitials(getUserDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                          {getUserDisplayName()}
                        </p>
                        {profile?.department && (
                          <p className="text-xs text-gray-500">
                            {profile.department}
                          </p>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-amber-600 transition-colors" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-2"
                  >
                    {/* User Info Header */}
                    <DropdownMenuLabel className="px-3 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 ring-2 ring-amber-200">
                          <AvatarImage src={profile?.avatar_url} alt={getUserDisplayName()} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                            {getInitials(getUserDisplayName())}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          {profile?.department && (
                            <p className="text-xs text-amber-600 font-medium">
                              {profile.department}
                            </p>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Admin Panel Link - Only show for admin/super_admin users */}
                      {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                        <DropdownMenuItem asChild>
                          <Link 
                            to="/admin"
                            className="flex items-center px-3 py-3 text-purple-600 hover:bg-purple-50 rounded-xl cursor-pointer transition-all duration-200"
                          >
                            <Shield className="w-4 h-4 mr-3" />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {/* Logout Button */}
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="flex items-center px-3 py-3 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span className="font-medium">Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  asChild
                  variant="ghost"
                  className="text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 px-4 py-2 font-medium"
                >
                  <Link to="/auth/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="elegant-button bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-6 py-2 font-semibold"
                >
                  <Link to="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>


      </div>
    </header>
  );
}
