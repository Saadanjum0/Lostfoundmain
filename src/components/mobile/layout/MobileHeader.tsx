import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Search,
  Shield,
  Home,
  Eye,
  Plus,
  MessageCircle
} from 'lucide-react';
import { MessagingButton } from '@/components/messaging/MessagingButton';

export default function MobileHeader() {
  const { user, profile, signOut, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header - Same styling as desktop */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo - Same as desktop */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Lost & Found
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Community Platform</p>
              </div>
            </Link>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Navigation Links - Hidden on mobile, shown on larger screens */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link to="/items/browse">
                  <Button variant="ghost" className="text-gray-700 hover:text-amber-600 hover:bg-amber-50">
                    Browse Items
                  </Button>
                </Link>
                <Link to="/report/lost">
                  <Button variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                    Report Lost
                  </Button>
                </Link>
                <Link to="/report/found">
                  <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                    Report Found
                  </Button>
                </Link>
              </nav>

              {/* Messaging Button */}
              {user && <MessagingButton />}
              
              {/* User Menu or Auth Buttons */}
              {loading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 ring-2 ring-amber-200">
                        <AvatarImage src={profile?.avatar_url} alt={getUserDisplayName()} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                          {getInitials(getUserDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="w-64" align="end" forceMount>
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
                          <p className="text-xs text-amber-600 font-medium capitalize">
                            {profile?.role || 'Student'}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    
                    {/* Admin Panel Link */}
                    {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                            <Shield className="w-4 h-4 mr-3" />
                            <span className="font-medium">Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={handleSignOut} className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/auth/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-gray-700 hover:text-amber-600 hover:bg-amber-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <Button variant="ghost" size="sm" onClick={closeMobileMenu}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Home</span>
                </Link>

                <Link
                  to="/items/browse"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Search className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Browse Items</span>
                </Link>

                {user && (
                  <Link
                    to="/messages"
                    className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Messages</span>
                  </Link>
                )}

                <div className="border-t border-gray-200 my-6"></div>

                <Link
                  to="/report/lost"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-amber-50 text-amber-700 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Report Lost Item</span>
                </Link>

                <Link
                  to="/report/found"
                  className="flex items-center space-x-3 p-4 rounded-xl hover:bg-green-50 text-green-700 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">Report Found Item</span>
                </Link>

                {!user && (
                  <>
                    <div className="border-t border-gray-200 my-6"></div>
                    <div className="space-y-3">
                      <Link to="/auth/login" onClick={closeMobileMenu}>
                        <Button variant="outline" className="w-full justify-start h-12">
                          <User className="w-4 h-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth/register" onClick={closeMobileMenu}>
                        <Button className="w-full justify-start h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                          <Plus className="w-4 h-4 mr-2" />
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
} 