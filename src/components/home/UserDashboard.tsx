import React, { useState, memo, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, Eye, Clock, Package, Heart, Plus, ArrowRight, 
  AlertCircle, CheckCircle, XCircle, Sparkles, User, Edit3, Trash2, MoreHorizontal,
  Filter, Grid, List, TrendingUp, Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useItems } from '@/hooks/useItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// Enhanced ItemCard component with proper image display
const ItemCard = memo(({ item, showOwner = true }: { item: any, showOwner?: boolean }) => {
  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'expired': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-amber-500" />;
      case 'resolved':
        return <Sparkles className="w-3 h-3 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  }, []);

  const getTypeColor = useCallback((type: string) => {
    return type === 'lost' 
      ? 'bg-amber-50 text-amber-700 border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }, []);

  return (
    <Card className="group premium-card bg-white/90 backdrop-blur-xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <CardContent className="p-0">
        {/* Enhanced Image Display */}
        <div className="relative overflow-hidden rounded-t-2xl h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {item.images && item.images.length > 0 ? (
            <img 
              src={item.images[0]} 
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback icon when no image */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200" style={{display: item.images && item.images.length > 0 ? 'none' : 'flex'}}>
          {item.item_type === 'lost' ? (
              <Search className="text-amber-400 w-16 h-16" />
          ) : (
              <Eye className="text-emerald-400 w-16 h-16" />
          )}
        </div>

          {/* Type Badge Overlay */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getTypeColor(item.item_type)} border font-medium text-xs px-2 py-1 backdrop-blur-sm`}>
              {item.item_type === 'lost' ? '🔍 Lost' : '✨ Found'}
          </Badge>
          </div>

          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(item.status)} border font-medium text-xs px-2 py-1 backdrop-blur-sm flex items-center gap-1`}>
            {getStatusIcon(item.status)}
              <span className="capitalize">{item.status}</span>
          </Badge>
          </div>
        </div>

        <div className="p-6">
        {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">
          {item.title}
        </h3>

        {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

          {/* Enhanced Details */}
          <div className="space-y-2 text-xs text-gray-500 mb-4">
            {(item.location_name || item.location) && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="truncate">{item.location_name || item.location}</span>
            </div>
          )}
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>{formatDate(item.created_at)}</span>
          </div>
          {showOwner && item.profiles && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="truncate">{item.profiles.full_name || 'Anonymous'}</span>
            </div>
          )}
        </div>

          {/* Action Button */}
        <Button 
          size="sm" 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-xl transition-all duration-300 group-hover:bg-gray-800"
          onClick={() => window.location.href = `/items/${item.id}`}
        >
          View Details
            <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ItemCard.displayName = 'ItemCard';

// Loading skeleton component
const ItemCardSkeleton = memo(() => (
  <Card className="premium-card bg-white/90 backdrop-blur-xl border border-gray-200/50">
    <CardContent className="p-0">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-2xl"></div>
      <div className="p-6 space-y-4">
        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
));

ItemCardSkeleton.displayName = 'ItemCardSkeleton';

const UserDashboard = memo(() => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("lost-items");

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigate = useNavigate();
  
  // Fetch items by type
  const { data: allItems, isLoading: allItemsLoading, error: allItemsError } = useItems({ limit: 50 });
  const { data: lostItems, isLoading: lostItemsLoading } = useItems({ itemType: 'lost', limit: 50 });
  const { data: foundItems, isLoading: foundItemsLoading } = useItems({ itemType: 'found', limit: 50 });
  
  // Fetch user's items using the dedicated hook
  const { data: myItems, isLoading: myItemsLoading, error: myItemsError } = useUserItems();

  // Don't block rendering - show dashboard immediately with loading states for individual sections

  // Memoized computations for better performance
  const stats = useMemo(() => ({
    myItemsCount: myItems?.length || 0,
    totalItemsCount: allItems?.length || 0,
    lostItemsCount: lostItems?.length || 0,
    foundItemsCount: foundItems?.length || 0
  }), [myItems, allItems, lostItems, foundItems]);



  // Session management - handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowLogoutDialog(true);
      // Push the current state back to prevent navigation
      window.history.pushState(null, '', window.location.pathname);
    };

    // Push initial state
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLogoutConfirm = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (window.location.pathname !== '/') {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Enhanced Welcome Section */}
      <Card className="premium-card bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white border-0 animate-fade-in-up overflow-hidden">
        <CardContent className="p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 font-['Poppins']">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 
              </h1>
              <p className="text-white/90 text-xl font-['Inter'] font-light">
                Ready to help your community find their belongings?
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-24 h-24 bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up [--animation-delay:200ms]">
        <Card className="group bg-gradient-to-br from-white to-purple-50/30 border border-purple-100/50 rounded-2xl hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2 font-['Inter']">My Items</p>
                <p className="text-3xl font-bold text-gray-900 font-['Poppins'] group-hover:text-purple-700 transition-colors">{stats.myItemsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover:from-purple-500 group-hover:to-purple-600 transition-all duration-300 shadow-lg">
                <User className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-white to-blue-50/30 border border-blue-100/50 rounded-2xl hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2 font-['Inter']">Community Items</p>
                <p className="text-3xl font-bold text-gray-900 font-['Poppins'] group-hover:text-blue-700 transition-colors">{stats.totalItemsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 shadow-lg">
                <Activity className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-white to-amber-50/30 border border-amber-100/50 rounded-2xl hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2 font-['Inter']">Lost Items</p>
                <p className="text-3xl font-bold text-gray-900 font-['Poppins'] group-hover:text-amber-700 transition-colors">{stats.lostItemsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center group-hover:from-amber-500 group-hover:to-amber-600 transition-all duration-300 shadow-lg">
                <Search className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-100/50 rounded-2xl hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2 font-['Inter']">Found Items</p>
                <p className="text-3xl font-bold text-gray-900 font-['Poppins'] group-hover:text-emerald-700 transition-colors">{stats.foundItemsCount}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:from-emerald-500 group-hover:to-emerald-600 transition-all duration-300 shadow-lg">
                <Eye className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-center animate-fade-in-up [--animation-delay:400ms]">
        <Button 
          size="lg" 
          className="elegant-button button-lost px-8 py-4 text-lg font-semibold group min-w-[200px]"
          onClick={() => window.location.href = '/report/lost'}
        >
          <Plus className="w-5 h-5 mr-3" />
          Report Lost Item
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Button 
          size="lg" 
          className="elegant-button button-found px-8 py-4 text-lg font-semibold group min-w-[200px]"
          onClick={() => window.location.href = '/report/found'}
        >
          <Eye className="w-5 h-5 mr-3" />
          Report Found Item
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button 
          size="lg" 
          variant="outline"
          className="elegant-button bg-white hover:bg-gray-50 border-2 border-gray-200 px-8 py-4 text-lg font-semibold group min-w-[200px]"
          onClick={() => window.location.href = '/items/browse'}
        >
          <Search className="w-5 h-5 mr-3" />
          Browse All Items
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Enhanced Tabs Section */}
      <div className="animate-fade-in-up [--animation-delay:600ms]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-2xl p-1.5 h-14">
          <TabsTrigger 
            value="lost-items" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-600 data-[state=active]:text-gray-900 transition-all"
          >
            🔍 Lost Items ({stats.lostItemsCount})
          </TabsTrigger>
          <TabsTrigger 
            value="found-items" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-600 data-[state=active]:text-gray-900 transition-all"
          >
              👁️ Found Items ({stats.foundItemsCount})
          </TabsTrigger>
          <TabsTrigger 
            value="my-items" 
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-semibold text-gray-600 data-[state=active]:text-gray-900 transition-all"
          >
              My Items ({stats.myItemsCount})
          </TabsTrigger>
        </TabsList>



          <TabsContent value="lost-items" className="mt-8">
          {lostItems && lostItems.length > 0 ? (
            <>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {lostItems.map((item) => (
                  <ItemCard key={item.id} item={item} showOwner={true} />
                ))}
              </div>
            </>
          ) : (
              <Card className="premium-card">
              <CardContent className="p-12 text-center">
                  <Search className="w-20 h-20 text-amber-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No lost items reported</h3>
                  <p className="text-gray-600 mb-8">Be the first to report a lost item in your community.</p>
                <Button 
                    className="elegant-button button-lost"
                    onClick={() => window.location.href = '/report/lost'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                  Report Lost Item
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="found-items" className="mt-8">
          {foundItems && foundItems.length > 0 ? (
            <>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {foundItems.map((item) => (
                  <ItemCard key={item.id} item={item} showOwner={true} />
                ))}
              </div>
            </>
          ) : (
              <Card className="premium-card">
              <CardContent className="p-12 text-center">
                  <Eye className="w-20 h-20 text-emerald-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No found items reported</h3>
                  <p className="text-gray-600 mb-8">Help your community by reporting items you've found.</p>
                <Button 
                    className="elegant-button button-found"
                    onClick={() => window.location.href = '/report/found'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                  Report Found Item
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

          <TabsContent value="my-items" className="mt-8">
          {myItems && myItems.length > 0 ? (
            <>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {myItems.map((item) => (
                  <ItemCard key={item.id} item={item} showOwner={false} />
                ))}
              </div>
            </>
          ) : (
              <Card className="premium-card">
              <CardContent className="p-12 text-center">
                  <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No items yet</h3>
                  <p className="text-gray-600 mb-8">You haven't reported any items yet. Get started by reporting a lost or found item.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      className="elegant-button button-lost"
                      onClick={() => window.location.href = '/report/lost'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                    Report Lost Item
                  </Button>
                    <Button 
                      className="elegant-button button-found"
                      onClick={() => window.location.href = '/report/found'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                    Report Found Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

  
      </Tabs>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out and redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard; 