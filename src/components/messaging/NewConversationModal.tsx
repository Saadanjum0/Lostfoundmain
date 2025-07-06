import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useItems } from '../../hooks/useItems';
import type { CreateConversationRequest } from '../../lib/messaging.types';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
  email: string;
}

interface Item {
  id: string;
  title: string;
  item_type: 'lost' | 'found';
  status: string;
  user_id: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (request: CreateConversationRequest) => Promise<any>;
}

export function NewConversationModal({ 
  isOpen, 
  onClose, 
  onCreateConversation 
}: NewConversationModalProps) {
  const { user } = useAuth();
  const { items } = useItems();
  const [conversationType, setConversationType] = useState<'direct' | 'item'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Search users
  useEffect(() => {
    if (conversationType === 'direct' && searchQuery.length > 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchQuery, conversationType]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .neq('id', user?.id)
        .ilike('full_name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    if (!selectedUsers.find(u => u.id === selectedUser.id)) {
      setSelectedUsers([...selectedUsers, selectedUser]);
      setSearchQuery('');
    }
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
  };

  const handleCreateConversation = async () => {
    if (creating) return;

    try {
      setCreating(true);

      let request: CreateConversationRequest;

      if (conversationType === 'direct') {
        if (selectedUsers.length === 0) {
          throw new Error('Please select at least one user');
        }

        request = {
          type: selectedUsers.length === 1 ? 'direct' : 'group',
          participant_ids: selectedUsers.map(u => u.id),
          title: selectedUsers.length > 1 ? 
            `Group chat with ${selectedUsers.map(u => u.full_name).join(', ')}` : 
            undefined,
        };
      } else {
        if (!selectedItem) {
          throw new Error('Please select an item');
        }

        request = {
          type: 'direct',
          item_id: selectedItem.id,
          participant_ids: [selectedItem.user_id],
          title: `Discussion about ${selectedItem.title}`,
        };
      }

      await onCreateConversation(request);
      handleClose();
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setSelectedItem(null);
    setConversationType('direct');
    onClose();
  };

  // Filter items for item conversations (exclude own items)
  const availableItems = items?.filter(item => 
    item.user_id !== user?.id && 
    item.status === 'approved'
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden">
          {/* Conversation Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Conversation Type</Label>
            <div className="flex gap-2">
              <Button
                variant={conversationType === 'direct' ? 'default' : 'outline'}
                onClick={() => setConversationType('direct')}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Direct Message
              </Button>
              <Button
                variant={conversationType === 'item' ? 'default' : 'outline'}
                onClick={() => setConversationType('item')}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                About Item
              </Button>
            </div>
          </div>

          {/* Direct Message Setup */}
          {conversationType === 'direct' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-search" className="text-sm font-medium mb-2 block">
                  Search Users
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="user-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type a name to search..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selected Users</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-2 p-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.full_name}</span>
                        <button
                          onClick={() => handleUserRemove(user.id)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* User Search Results */}
              {searchQuery.length > 2 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Search Results</Label>
                  <ScrollArea className="h-40 border rounded-lg">
                    {loading ? (
                      <div className="p-3 space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : users.length > 0 ? (
                      <div className="p-2">
                        {users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            disabled={selectedUsers.find(u => u.id === user.id) !== undefined}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <div className="font-medium text-sm">{user.full_name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No users found
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Item Conversation Setup */}
          {conversationType === 'item' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Select Item to Discuss
                </Label>
                <ScrollArea className="h-60 border rounded-lg">
                  {availableItems.length > 0 ? (
                    <div className="p-2">
                      {availableItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedItem?.id === item.id
                              ? 'border-blue-200 bg-blue-50'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-2xl">
                            {item.item_type === 'lost' ? '🔍' : '✅'}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium text-sm">{item.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={item.item_type === 'lost' ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {item.item_type === 'lost' ? 'Lost' : 'Found'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No items available for discussion
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={
                creating ||
                (conversationType === 'direct' && selectedUsers.length === 0) ||
                (conversationType === 'item' && !selectedItem)
              }
            >
              {creating ? 'Creating...' : 'Start Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
