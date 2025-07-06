
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Eye, Loader2 } from 'lucide-react';
import { useRecentItems } from '@/hooks/useItems';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RecentItems = () => {
  const { data: recentItems = [], isLoading, error } = useRecentItems(6);
  
  // Filter items by type
  const recentLostItems = recentItems.filter(item => item.item_type === 'lost');
  const recentFoundItems = recentItems.filter(item => item.item_type === 'found');

  const ItemCard = ({ item, type }: { item: any, type: 'lost' | 'found' }) => (
    <Card className="elegant-card hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
      <div className="relative">
        <img 
          src={item.images?.[0] || "/placeholder.svg"} 
          alt={item.title}
          className="w-full h-52 object-cover rounded-t-2xl"
        />
        <Badge 
          variant={type === 'lost' ? 'destructive' : 'default'}
          className={`absolute top-3 right-3 ${type === 'lost' ? 'bg-black text-white' : 'bg-yellow-200 text-black'} font-semibold`}
        >
          {type === 'lost' ? 'Lost' : 'Found'}
        </Badge>
        {item.reward_offered && (
          <Badge 
            variant="secondary"
            className="absolute top-3 left-3 bg-yellow-300 text-black font-semibold"
          >
            ${item.reward_offered} Reward
          </Badge>
        )}
      </div>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl group-hover:text-black transition-colors text-gray-800">
            {item.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
            {item.category?.name || 'Other'}
          </Badge>
        </div>
        <CardDescription className="text-base text-gray-600">
          {item.description.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {item.location?.name || 'Unknown'}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </div>
        </div>
        <Button asChild className="w-full elegant-button bg-gray-100 hover:bg-black text-gray-800 hover:text-white border-0" variant="outline">
          <Link to={`/items/${item.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading recent items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Error loading recent items. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-gray-100 rounded-2xl p-2">
          <TabsTrigger 
            value="lost" 
            className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl py-3 text-gray-700 font-semibold"
          >
            Recent Lost Items ({recentLostItems.length})
          </TabsTrigger>
          <TabsTrigger 
            value="found" 
            className="data-[state=active]:bg-yellow-200 data-[state=active]:text-black rounded-xl py-3 text-gray-700 font-semibold"
          >
            Recent Found Items ({recentFoundItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lost" className="mt-10">
          {recentLostItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentLostItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" className="px-10 py-4 elegant-button border-black text-black hover:bg-black hover:text-white">
                  <Link to="/items/lost">View All Lost Items</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No recent lost items found.</p>
              <Button asChild className="elegant-button bg-primary hover:bg-primary/90 text-white">
                <Link to="/report/lost">Report a Lost Item</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="found" className="mt-10">
          {recentFoundItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentFoundItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" className="px-10 py-4 elegant-button border-black text-black hover:bg-black hover:text-white">
                  <Link to="/items/found">View All Found Items</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No recent found items.</p>
              <Button asChild className="elegant-button bg-yellow-200 hover:bg-yellow-300 text-black">
                <Link to="/report/found">Report a Found Item</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentItems;
