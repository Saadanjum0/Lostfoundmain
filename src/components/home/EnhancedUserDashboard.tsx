import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, Eye, Clock, Package, Heart, Plus, ArrowRight, 
  AlertCircle, CheckCircle, XCircle, Sparkles, User, Edit3, Trash2, MoreHorizontal,
  Filter, Grid, List
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useItems } from '@/hooks/useItems';
import { useUserItems } from '@/hooks/useUserItems';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import SplitText from '@/components/ui/SplitText';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EnhancedUserDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch all items for overview
  const { data: allItems, isLoading: allItemsLoading } = useItems({ limit: 50 });
  
  // Fetch user's items
  const { data: myItems, isLoading: myItemsLoading } = useUserItems();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' 
      ? 'bg-amber-100 text-amber-800 border-amber-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  // Filter items based on search
  const filteredItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items?.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  const ItemCard = ({ item, showOwner = true, showActions = false }: { item: any, showOwner?: boolean, showActions?: boolean }) => (
    <Card className={`elegant-card group hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm ${viewMode === 'list' ? 'flex-row' : ''}`}>
      <CardContent className={`p-6 ${viewMode === 'list' ? 'flex items-center space-x-6 w-full' : ''}`}>
        {/* Image placeholder */}
        <div className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${viewMode === 'list' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-48 mb-4'}`}>
          {item.item_type === 'lost' ? (
            <Search className={`text-amber-500 ${viewMode === 'list' ? 'w-8 h-8' : 'w-12 h-12'}`} />
          ) : (
            <Eye className={`text-green-500 ${viewMode === 'list' ? 'w-8 h-8' : 'w-12 h-12'}`} />
          )}
        </div>

        <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className={`${getTypeColor(item.item_type)} border font-medium px-3 py-1`}>
              {item.item_type === 'lost' ? '🔍 Lost' : '👁️ Found'}
            </Badge>
            <Badge className={`${getStatusColor(item.status)} border font-medium px-3 py-1`}>
              {getStatusIcon(item.status)}
              <span className="ml-1 capitalize">{item.status}</span>
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Details */}
          <div className={`flex flex-wrap gap-4 text-sm text-gray-500 ${viewMode === 'list' ? 'mb-0' : 'mb-4'}`}>
            {item.category && (
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{item.category.name}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{item.location.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(item.created_at)}</span>
            </div>
            {showOwner && item.profiles && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{item.profiles.full_name}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-2' : ''}`}>
            <Button 
              size="sm" 
              className="elegant-button bg-gray-900 hover:bg-gray-800 text-white"
              onClick={() => window.location.href = `/items/${item.id}`}
            >
              View Details
            </Button>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Item
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (allItemsLoading || myItemsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="elegant-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="elegant-card bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <SplitText
                text={`Welcome back, ${profile?.full_name || user?.email?.split('@')[0]}! 👋`}
                className="text-3xl font-bold mb-2"
                delay={100}
                duration={0.7}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 30, scale: 0.95 }}
                to={{ opacity: 1, y: 0, scale: 1 }}
                threshold={0.3}
                rootMargin="-100px"
                textAlign="left"
              />
              <p className="text-white/90 text-lg">
                Track your items and help others find their belongings
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="elegant-card group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">My Items</p>
                <p className="text-3xl font-bold text-gray-900">{myItems?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elegant-card group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{allItems?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elegant-card group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Lost Items</p>
                <p className="text-3xl font-bold text-amber-600">{allItems?.filter(item => item.item_type === 'lost').length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elegant-card group hover:shadow-xl transition-all duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Found Items</p>
                <p className="text-3xl font-bold text-green-600">{allItems?.filter(item => item.item_type === 'found').length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          className="elegant-button button-lost px-8 py-4 text-lg font-semibold group"
          onClick={() => window.location.href = '/report/lost'}
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Report Lost Item
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
        
        <Button 
          size="lg" 
          className="elegant-button button-found px-8 py-4 text-lg font-semibold group"
          onClick={() => window.location.href = '/report/found'}
        >
          <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
          Report Found Item
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>

        <Button 
          size="lg" 
          variant="outline"
          className="elegant-button px-8 py-4 text-lg font-semibold group border-2"
          onClick={() => window.location.href = '/items/browse'}
        >
          <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
          Browse All Items
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-2xl p-1">
          <TabsTrigger 
            value="overview" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-900 data-[state=active]:to-gray-700 data-[state=active]:text-white font-semibold"
          >
            Recent Items
          </TabsTrigger>
          <TabsTrigger 
            value="my-items" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold"
          >
            My Items ({myItems?.length || 0})
          </TabsTrigger>
          <TabsTrigger 
            value="all-items" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold"
          >
            All Items ({allItems?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Search and Filter Bar */}
        {(activeTab === 'my-items' || activeTab === 'all-items') && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 elegant-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allItems?.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} showOwner={true} />
            ))}
          </div>
          {allItems && allItems.length > 6 && (
            <div className="text-center mt-8">
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setActiveTab('all-items')}
              >
                View All Items ({allItems.length})
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-items" className="mt-6">
          {myItems && myItems.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredItems(myItems).map((item) => (
                <ItemCard key={item.id} item={item} showOwner={false} showActions={true} />
              ))}
            </div>
          ) : (
            <Card className="elegant-card">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <SplitText
                  text="No Items Yet"
                  className="text-xl font-semibold text-gray-900 mb-2"
                  delay={70}
                  duration={0.5}
                  ease="power2.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.5}
                  rootMargin="-50px"
                  textAlign="center"
                />
                <p className="text-gray-600 mb-6">You haven't reported any lost or found items yet.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/report/lost'}>
                    Report Lost Item
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/report/found'}>
                    Report Found Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all-items" className="mt-6">
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredItems(allItems || []).map((item) => (
              <ItemCard key={item.id} item={item} showOwner={true} />
            ))}
          </div>
          {filteredItems(allItems || []).length === 0 && searchQuery && (
            <Card className="elegant-card">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <SplitText
                  text="No Results Found"
                  className="text-xl font-semibold text-gray-900 mb-2"
                  delay={80}
                  duration={0.5}
                  ease="power2.out"
                  splitType="words"
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.5}
                  rootMargin="-50px"
                  textAlign="center"
                />
                <p className="text-gray-600">Try adjusting your search terms or browse all items.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedUserDashboard; 