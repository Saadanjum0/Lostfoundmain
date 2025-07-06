import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Search, Filter, User, Mail, Calendar, MoreHorizontal, Ban, Shield, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminUsers, useBanUser, useUnbanUser, useChangeUserRole } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/lib/database.types';
import AdminLayout from '@/components/layout/AdminLayout';

const AdminUsers = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check if user is admin
  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return <Navigate to="/" replace />;
  }

  // Fetch users using the admin hook
  const { data: users, isLoading, error } = useAdminUsers({
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery
  });

  // Use admin mutations
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const changeRoleMutation = useChangeUserRole();

  const handleBanUser = (userId: string, username: string) => {
    const reason = prompt(`Please provide a reason for banning ${username}:`);
    if (reason) {
      banUserMutation.mutate({ userId, reason }, {
        onSuccess: () => toast({ title: "User banned successfully" }),
        onError: () => toast({ title: "Error banning user", variant: "destructive" })
      });
    }
  };

  const handleUnbanUser = (userId: string) => {
    if (confirm("Are you sure you want to unban this user?")) {
      unbanUserMutation.mutate(userId, {
        onSuccess: () => toast({ title: "User unbanned successfully" }),
        onError: () => toast({ title: "Error unbanning user", variant: "destructive" })
      });
    }
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      changeRoleMutation.mutate({ userId, newRole }, {
        onSuccess: () => toast({ title: "User role updated successfully" }),
        onError: () => toast({ title: "Error updating user role", variant: "destructive" })
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      student: { className: 'bg-blue-100 text-blue-800' },
      faculty: { className: 'bg-green-100 text-green-800' },
      admin: { className: 'bg-purple-100 text-purple-800' },
      super_admin: { className: 'bg-red-100 text-red-800' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student;
    
    return (
      <Badge className={config.className}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (isBanned: boolean) => {
    return (
      <Badge className={isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
        {isBanned ? 'Banned' : 'Active'}
      </Badge>
    );
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
                              Users ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">Error loading users</div>
                          ) : !users || users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{userData.full_name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(userData.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(userData.is_banned)}
                        {userData.is_banned && userData.ban_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            {userData.ban_reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{userData.department || 'N/A'}</TableCell>
                      <TableCell>{userData.student_id || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(userData.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!userData.is_banned ? (
                              <DropdownMenuItem 
                                onClick={() => handleBanUser(userData.id, userData.full_name)}
                                className="text-red-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUnbanUser(userData.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            )}
                            
                            {userData.role !== 'admin' && userData.role !== 'super_admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeRole(userData.id, 'admin')}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            
                            {userData.role === 'admin' && profile.role === 'super_admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleChangeRole(userData.id, 'student')}
                              >
                                <User className="h-4 w-4 mr-2" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default AdminUsers; 