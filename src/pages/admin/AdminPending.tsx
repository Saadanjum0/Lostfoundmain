import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Clock, Check, X, Eye, Calendar, MapPin, User, AlertTriangle, Package, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useItems } from '@/hooks/useItems';
import { useApproveItem, useRejectItem } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminPending = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Check if user is admin
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  // Fetch pending items
  const { data: pendingItems = [], isLoading, error } = useItems({
    status: 'pending',
    includeAllStatuses: true,
    limit: 100
  });

  // Filter items by search query
  const filteredItems = pendingItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.profiles?.full_name?.toLowerCase().includes(query) ||
      item.category?.name.toLowerCase().includes(query)
    );
  });

  // Use admin hooks for approve/reject
  const approveItemMutation = useApproveItem();
  const rejectItemMutation = useRejectItem();

  const handleApprove = (itemId: string) => {
    if (confirm("Are you sure you want to approve this item? It will become visible to all users.")) {
      approveItemMutation.mutate(itemId, {
        onSuccess: () => {
          toast({ 
            title: "Item Approved", 
            description: "The item has been approved and is now live on the site."
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to approve item. Please try again.",
            variant: "destructive"
          });
        }
      });
    }
  };

  const handleReject = (item: any) => {
    setSelectedItem(item);
    setRejectReason('');
  };

  const submitRejection = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this item.",
        variant: "destructive"
      });
      return;
    }
    
    rejectItemMutation.mutate({ 
      itemId: selectedItem.id, 
      reason: rejectReason.trim() 
    }, {
      onSuccess: () => {
        setRejectReason('');
        setSelectedItem(null);
        toast({ 
          title: "Item Rejected", 
          description: "The item has been rejected and the user will be notified."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to reject item. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const getItemTypeBadge = (type: string) => (
    <Badge className={type === 'lost' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Items</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingItems.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lost Items</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {pendingItems.filter(item => item.item_type === 'lost').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Found Items</p>
                  <p className="text-3xl font-bold text-green-600">
                    {pendingItems.filter(item => item.item_type === 'found').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search Pending Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title, description, user, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Approval ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading pending items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
                Error loading pending items
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Pending Items</h3>
                <p>All items have been reviewed. Great job!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-yellow-400">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                            {getItemTypeBadge(item.item_type)}
                            <Badge variant="outline">{item.category?.name}</Badge>
                            {item.is_urgent && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{item.profiles?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {item.reward_offered && (
                            <div className="mt-2">
                              <Badge className="bg-yellow-100 text-yellow-800">
                                ${item.reward_offered} Reward Offered
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="ml-6 space-y-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{item.title}</DialogTitle>
                                <DialogDescription>Review item details before approval</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Description</h4>
                                  <p className="text-gray-700">{item.description}</p>
                                </div>
                                
                                {item.images && item.images.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Images</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {item.images.map((imageUrl, index) => (
                                        <img
                                          key={index}
                                          src={imageUrl}
                                          alt={`${item.title} - Image ${index + 1}`}
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Category:</strong> {item.category?.name}
                                  </div>
                                  <div>
                                    <strong>Location:</strong> {item.location?.name}
                                  </div>
                                  <div>
                                    <strong>Date {item.item_type}:</strong> {new Date(item.date_lost_found).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <strong>Contact:</strong> {item.contact_email}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            onClick={() => handleApprove(item.id)}
                            disabled={approveItemMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          
                          <Button
                            onClick={() => handleReject(item)}
                            disabled={rejectItemMutation.isPending}
                            variant="destructive"
                            className="w-full"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Item: {selectedItem?.title}</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this item. The user will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={submitRejection}
                  disabled={rejectItemMutation.isPending}
                >
                  Reject Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPending; 