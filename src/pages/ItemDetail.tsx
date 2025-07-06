import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MapPin, User, Phone, Clock, Tag, Image as ImageIcon, 
  AlertTriangle, Eye, Share2, Heart, MessageCircle, Star, Badge as BadgeIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useItem } from '../hooks/useItems';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { ItemMessagingButton } from '../components/messaging/ItemMessagingButton';
import SplitText from '../components/ui/SplitText';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { data: item, isLoading, error } = useItem(id!);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'lost' 
      ? 'bg-amber-100 text-amber-800 border-amber-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };



  const handlePhoneClick = (phone: string) => {
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: `Check out this ${item?.item_type} item: ${item?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading item details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <Card className="elegant-card max-w-md">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <SplitText
                  text="Item Not Found"
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
                <p className="text-gray-600 mb-4">The item you're looking for doesn't exist or has been removed.</p>
                <Link to="/items/browse">
                  <Button className="elegant-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Browse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (item.status !== 'approved' && (!user || item.user_id !== user.id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-12">
            <Card className="elegant-card max-w-md">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <SplitText
                  text="Item Not Available"
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
                <p className="text-gray-600 mb-4">
                  {item.status === 'pending' 
                    ? 'This item is still under review and will be available once approved.'
                    : 'This item is not currently available for viewing.'
                  }
                </p>
                <Link to="/items/browse">
                  <Button className="elegant-button">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Browse
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/items/browse">
            <Button variant="outline" className="elegant-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <SplitText
                      text={item.title}
                      className="text-3xl font-bold text-gray-900 mb-3"
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
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getTypeColor(item.item_type)} border font-medium px-3 py-1`}>
                        {item.item_type === 'lost' ? '🔍 Lost Item' : '👁️ Found Item'}
                      </Badge>
                      <Badge className={`${getStatusColor(item.status)} border font-medium px-3 py-1`}>
                        {item.status === 'approved' ? '✅ Available' : `📋 ${item.status}`}
                      </Badge>
                      {item.is_urgent && (
                        <Badge className="bg-red-100 text-red-800 border-red-200 font-medium px-3 py-1">
                          🚨 Urgent
                        </Badge>
                      )}
                      {item.reward_offered && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 font-medium px-3 py-1">
                          💰 ${item.reward_offered} Reward
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <SplitText
                    text="Description"
                    className="text-lg font-semibold text-gray-900 mb-3"
                    delay={70}
                    duration={0.5}
                    ease="power2.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 20 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.4}
                    rootMargin="-80px"
                    textAlign="left"
                  />
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>
              </CardContent>
            </Card>

            {item.images && item.images.length > 0 && (
              <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Images ({item.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {item.images.map((imageUrl, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                        <img
                          src={imageUrl}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{item.category?.name || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{item.location?.name || 'Not specified'}</p>
                        {item.specific_location && (
                          <p className="text-sm text-gray-500">{item.specific_location}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date {item.item_type}</p>
                        <p className="font-medium">
                          {new Date(item.date_lost_found).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {item.time_lost_found && (
                          <p className="text-sm text-gray-500">at {item.time_lost_found}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Views</p>
                        <p className="font-medium">{item.views_count || 0} views</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Posted</p>
                        <p className="font-medium">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {item.item_type === 'lost' && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-medium">
                            {item.status === 'resolved' ? 'Found & Reunited! 🎉' : 'Still Missing'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Owner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {item.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.profiles?.full_name || 'Anonymous'}</p>
                    {item.profiles?.student_id && (
                      <p className="text-sm text-gray-600">Student ID: {item.profiles.student_id}</p>
                    )}
                  </div>
                </div>

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Please log in to contact the owner
                    </p>
                    <Link to={`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`}>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Log In to Contact
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  {item.contact_phone && (
                    <Button 
                      variant="outline"
                      onClick={() => handlePhoneClick(item.contact_phone)}
                      className="w-full"
                      disabled={!user}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call {item.contact_phone}
                    </Button>
                  )}

                  {/* Messaging Button */}
                  {user && item.user_id !== user.id && (
                    <ItemMessagingButton
                      itemId={item.id}
                      ownerId={item.user_id}
                      variant="default"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    />
                  )}

                  {!item.contact_phone && (!user || item.user_id === user.id) && (
                    <div className="text-center py-4">
                      <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Use the messaging system to contact</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>
                  {item.item_type === 'lost' ? '🔍 Found This Item?' : '👋 Is This Yours?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  {item.item_type === 'lost' ? (
                    <>
                      <p>• Contact the owner using the information above</p>
                      <p>• Be prepared to describe the item to verify ownership</p>
                      <p>• Arrange a safe meeting place on campus</p>
                      <p>• Report spam or inappropriate content</p>
                    </>
                  ) : (
                    <>
                      <p>• Contact the finder using the information above</p>
                      <p>• Be ready to prove ownership of the item</p>
                      <p>• Arrange to meet in a public campus location</p>
                      <p>• Thank the finder for their honesty! 🙏</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border border-blue-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <BadgeIcon className="h-5 w-5" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Always meet in public campus areas</p>
                  <p>• Bring a friend when meeting strangers</p>
                  <p>• Verify identity before sharing personal info</p>
                  <p>• Report suspicious behavior to campus security</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItemDetail; 