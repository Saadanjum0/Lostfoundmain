import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Eye, Check, X, MoreHorizontal, Calendar, MapPin, User, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useItems, useCategories, useLocations } from '@/hooks/useItems';
import { useApproveItem, useRejectItem, useDeleteItem, useResolveItem } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminItems = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

  // Check if user is admin
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  const { data: categories } = useCategories();
  const { data: locations } = useLocations();

  // Fetch items with filters - focus on approved and resolved items (live items)
  const { data: items, isLoading, error } = useItems({
    itemType: typeFilter === 'all' ? undefined : typeFilter as 'lost' | 'found',
    categoryId: categoryFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 100,
    includeAllStatuses: true // Admin can see all statuses
  });

  // Filter out pending items by default, focus on live items
  const liveItems = items?.filter(item => item.status !== 'pending') || [];

  // Filter items by search query
  const filteredItems = liveItems?.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.profiles?.full_name?.toLowerCase().includes(query) ||
      item.category?.name.toLowerCase().includes(query)
    );
  }) || [];

  // Admin action hooks
  const approveItemMutation = useApproveItem();
  const rejectItemMutation = useRejectItem();
  const deleteItemMutation = useDeleteItem();
  const resolveItemMutation = useResolveItem();

  const handleApprove = (itemId: string) => {
    approveItemMutation.mutate(itemId, {
      onSuccess: () => toast({ title: "Item approved successfully" }),
      onError: () => toast({ title: "Error approving item", variant: "destructive" })
    });
  };

  const handleReject = (itemId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      rejectItemMutation.mutate({ itemId, reason }, {
        onSuccess: () => toast({ title: "Item rejected successfully" }),
        onError: () => toast({ title: "Error rejecting item", variant: "destructive" })
      });
    }
  };

  const handleDelete = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      deleteItemMutation.mutate(itemId, {
        onSuccess: () => toast({ title: "Item deleted successfully" }),
        onError: () => toast({ title: "Error deleting item", variant: "destructive" })
      });
    }
  };

  const handleResolve = (itemId: string) => {
    if (confirm("Mark this item as resolved? This indicates the item has been successfully returned to its owner.")) {
      resolveItemMutation.mutate(itemId, {
        onSuccess: () => toast({ title: "Item marked as resolved" }),
        onError: () => toast({ title: "Error resolving item", variant: "destructive" })
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: 'bg-yellow-100 text-yellow-800' },
      approved: { className: 'bg-green-100 text-green-800' },
      resolved: { className: 'bg-blue-100 text-blue-800' },
      rejected: { className: 'bg-red-100 text-red-800' },
      expired: { className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateSearchParams('search', e.target.value);
                  }}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                updateSearchParams('status', value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                updateSearchParams('type', value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => {
                setCategoryFilter(value);
                updateSearchParams('category', value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setCategoryFilter('');
                  setSearchParams(new URLSearchParams());
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Live Items ({filteredItems.length})
              </CardTitle>
              <div className="flex gap-2">
                <Link to="/admin/pending">
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    View Pending Requests
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading items...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">Error loading items</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No items found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500 truncate">
                            {item.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.item_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{item.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">{item.profiles?.student_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {item.location?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link to={`/admin/items/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/items/${item.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {item.status === 'approved' && (
                                <DropdownMenuItem onClick={() => handleReject(item.id)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Take Down Item
                                </DropdownMenuItem>
                              )}
                              {item.status === 'rejected' && (
                                <DropdownMenuItem onClick={() => handleApprove(item.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Restore Item
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminItems; 