import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useParams } from 'react-router-dom';
import { Check, X, Eye, Calendar, MapPin, User, Mail, Phone, Clock, Tag, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useItem } from '@/hooks/useItems';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminItemDetail = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  // Check if user is admin
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  const { data: item, isLoading, error } = useItem(id!);

  // Admin actions mutations
  const approveItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('items')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: "Item approved successfully" });
    }
  });

  const rejectItemMutation = useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      const { error } = await supabase
        .from('items')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: "Item rejected successfully" });
    }
  });

  const resolveItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('items')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: "Item marked as resolved" });
    }
  });

  const handleApprove = () => {
    if (item) {
      approveItemMutation.mutate(item.id);
    }
  };

  const handleReject = () => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason && item) {
      rejectItemMutation.mutate({ itemId: item.id, reason });
    }
  };

  const handleResolve = () => {
    if (item && confirm("Mark this item as resolved? This means the item has been successfully returned to its owner.")) {
      resolveItemMutation.mutate(item.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { className: 'bg-green-100 text-green-800', icon: Check },
      resolved: { className: 'bg-blue-100 text-blue-800', icon: Check },
      rejected: { className: 'bg-red-100 text-red-800', icon: X },
      expired: { className: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !item) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Item Not Found</h2>
            <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been deleted.</p>
            <Link to="/admin/items">
              <Button>Back to Items</Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Item Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
            <p className="text-gray-600 mt-1">Item ID: {item.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(item.status)}
            <Badge variant="outline" className="capitalize">
              {item.item_type}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Item Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{item.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium">{item.category?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium">{item.location?.name || 'N/A'}</span>
                      </div>
                      {item.specific_location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Specific:</span>
                          <span className="text-sm font-medium">{item.specific_location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Date {item.item_type}:</span>
                        <span className="text-sm font-medium">
                          {new Date(item.date_lost_found).toLocaleDateString()}
                        </span>
                      </div>
                      {item.time_lost_found && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium">{item.time_lost_found}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Metadata</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Views:</span>
                        <span className="text-sm font-medium">{item.views_count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Submitted:</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Updated:</span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      {item.is_urgent && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Urgent</span>
                        </div>
                      )}
                      {item.reward_offered && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Reward:</span>
                          <span className="text-sm font-medium">${item.reward_offered}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Images ({item.images.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {item.images.map((imageUrl, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`${item.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Rejection Reason */}
                {item.status === 'rejected' && item.rejection_reason && (
                  <>
                    <Separator />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Rejection Reason
                      </h4>
                      <p className="text-red-700">{item.rejection_reason}</p>
                    </div>
                  </>
                )}

                {/* Admin Notes */}
                {item.admin_notes && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Admin Notes</h4>
                      <p className="text-blue-700">{item.admin_notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Submitted By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{item.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">{item.profiles?.student_id}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{item.contact_email}</span>
                  </div>
                  {item.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{item.contact_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.status === 'pending' && (
                  <>
                    <Button 
                      onClick={handleApprove}
                      disabled={approveItemMutation.isPending}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Item
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejectItemMutation.isPending}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Item
                    </Button>
                  </>
                )}

                {item.status === 'approved' && (
                  <>
                    <Button 
                      onClick={handleResolve}
                      disabled={resolveItemMutation.isPending}
                      className="w-full"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleReject}
                      disabled={rejectItemMutation.isPending}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Item
                    </Button>
                  </>
                )}

                {item.status === 'rejected' && (
                  <Button 
                    onClick={handleApprove}
                    disabled={approveItemMutation.isPending}
                    className="w-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Item
                  </Button>
                )}

                {item.status === 'resolved' && (
                  <div className="text-center py-4">
                    <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Item has been resolved</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Item Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="text-sm font-medium">{item.views_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days Active</span>
                    <span className="text-sm font-medium">
                      {Math.ceil((new Date().getTime() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-medium capitalize">{item.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminItemDetail; 