import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings, 
  LogOut,
  Bell,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePendingItemsCount } from '@/hooks/useAdmin';
import SplitText from '@/components/ui/SplitText';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, userProfile, signOut } = useAuth();
  const location = useLocation();

  // Fetch pending items count for notification badge
  const { data: pendingCount } = usePendingItemsCount();

  const getUserDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarLinks = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      href: '/admin/pending',
      icon: Clock,
      label: 'Pending Requests',
      badge: pendingCount || 0,
      badgeColor: 'bg-yellow-500'
    },
    {
      href: '/admin/items',
      icon: Package,
      label: 'All Items'
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'User Management'
    }
  ];

  const isActiveLink = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Admin Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <SplitText
                text="Admin Panel"
                className="text-xl font-bold text-gray-900"
                delay={70}
                duration={0.5}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.5}
                rootMargin="-50px"
                textAlign="left"
              />
              <p className="text-sm text-gray-600">Lost & Found System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href, link.exact);
            
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span className="font-medium">{link.label}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <Badge className={`${link.badgeColor} text-white text-xs px-2 py-1`}>
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={userProfile?.avatar_url} alt={getUserDisplayName()} />
              <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
                {getInitials(getUserDisplayName())}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-purple-600 font-medium">
                {userProfile?.role?.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              asChild
            >
              <Link to="/">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                User Site
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SplitText
                text={
                  location.pathname === '/admin' ? 'Dashboard' :
                  location.pathname === '/admin/pending' ? 'Pending Requests' :
                  location.pathname === '/admin/items' ? 'All Items' :
                  location.pathname === '/admin/users' ? 'User Management' :
                  location.pathname.startsWith('/admin/items/') ? 'Item Details' : 'Admin'
                }
                className="text-2xl font-bold text-gray-900"
                delay={80}
                duration={0.6}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 25 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.4}
                rootMargin="-80px"
                textAlign="left"
              />
              <p className="text-gray-600 mt-1">
                Manage your Lost & Found system
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {pendingCount && pendingCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full p-0">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 