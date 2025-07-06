import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Search, TrendingUp, Users, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleDashboard = memo(() => {
  const quickActions = [
    {
      title: "Report Lost Item",
      description: "Lost something? Report it here and let the community help you find it.",
      icon: Plus,
      href: "/report/lost",
      color: "from-amber-400 to-orange-500"
    },
    {
      title: "Report Found Item", 
      description: "Found something? Help reunite it with its owner by reporting it here.",
      icon: Eye,
      href: "/report/found",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Browse Items",
      description: "Search through lost and found items to see if yours is here.",
      icon: Search,
      href: "/items/browse", 
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "View Statistics",
      description: "See how our community is helping reunite people with their belongings.",
      icon: TrendingUp,
      href: "/stats",
      color: "from-purple-400 to-purple-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-white mb-4">
          Your Dashboard
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Your personal hub for lost and found items. Get started by reporting an item or browsing what others have found.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-200">
        {quickActions.map((action, index) => (
          <Card 
            key={action.title}
            className="elegant-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-0 overflow-hidden"
            style={{animationDelay: `${index * 100}ms`}}
          >
            <CardHeader className="text-center pb-4">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${action.color}`}>
                <action.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                {action.description}
              </p>
              <Button 
                asChild 
                className="w-full elegant-button bg-black hover:bg-gray-800 text-white py-2 shadow-lg"
              >
                <Link to={action.href}>
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16 animate-fade-in-up animation-delay-400">
        <Button 
          size="lg" 
          className="elegant-button button-lost px-12 py-5 text-xl font-semibold min-w-[240px] group shadow-2xl"
          onClick={() => window.location.href = '/report/lost'}
        >
          <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
          Report Lost Item
        </Button>
        
        <Button 
          size="lg" 
          className="elegant-button button-found px-12 py-5 text-xl font-semibold min-w-[240px] group shadow-2xl"
          onClick={() => window.location.href = '/report/found'}
        >
          <Eye className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
          Report Found Item
        </Button>
      </div>

      {/* Statistics Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto animate-fade-in-up animation-delay-600">
        <div className="glass-card p-8 rounded-2xl text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300 transition-colors">1,247</div>
          <p className="text-white/70 font-medium text-lg">Items Reunited</p>
        </div>
        <div className="glass-card p-8 rounded-2xl text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-green-400 mb-3 group-hover:text-green-300 transition-colors">892</div>
          <p className="text-white/70 font-medium text-lg">Active Users</p>
        </div>
        <div className="glass-card p-8 rounded-2xl text-center group hover:scale-105 transition-transform duration-300">
          <div className="text-4xl font-bold text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">24h</div>
          <p className="text-white/70 font-medium text-lg">Avg. Recovery Time</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 lg:p-16 text-white mt-16 animate-fade-in-up animation-delay-800">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Join Our Community
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Help build a community where lost items find their way home. Every report makes a difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="elegant-button button-lost px-8 py-4 text-lg font-semibold"
            onClick={() => window.location.href = '/auth/register'}
          >
            <Plus className="w-5 h-5 mr-2" />
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="elegant-button px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900"
            onClick={() => window.location.href = '/items/browse'}
          >
            <Eye className="w-5 h-5 mr-2" />
            Browse Items
          </Button>
        </div>
      </div>
    </div>
  );
});

SimpleDashboard.displayName = 'SimpleDashboard';

export default SimpleDashboard; 