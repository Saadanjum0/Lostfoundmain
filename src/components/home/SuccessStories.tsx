
import { Star, Heart, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const SuccessStories = () => {
  const stories = [
    {
      id: 1,
      name: "Jessica Chen",
      avatar: "/placeholder.svg",
      item: "MacBook Pro",
      story: "I left my laptop in the study hall and panicked when I realized it was gone. Posted it here and got a message within 2 hours from someone who found it. Amazing!",
      timeAgo: "2 days ago",
      category: "Electronics"
    },
    {
      id: 2,
      name: "Marcus Williams",
      avatar: "/placeholder.svg",
      item: "Wedding Ring",
      story: "Lost my grandmother's ring at the gym. Thought it was gone forever. A staff member found it and posted here. I'm so grateful for this platform!",
      timeAgo: "1 week ago",
      category: "Jewelry"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      avatar: "/placeholder.svg",
      item: "Textbooks",
      story: "Someone found my entire stack of textbooks that I accidentally left in the library. Saved me $500+ in replacement costs!",
      timeAgo: "3 days ago",
      category: "Books"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Single Centered Statistic */}
      <div className="text-center mb-16">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <div className="text-5xl font-bold text-white mb-3">1,247</div>
          <div className="text-xl text-gray-300 font-medium">Items Successfully Reunited</div>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full mt-4"></div>
        </div>
      </div>

      {/* Success Stories Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Success Stories</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Real stories from our community members who found their lost items
        </p>
      </div>

      {/* Success Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stories.map((story, index) => (
          <Card key={story.id} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-14 h-14 ring-2 ring-gray-200">
                  <AvatarImage src={story.avatar} alt={story.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-gray-700 font-bold text-lg">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg text-gray-900">{story.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                      {story.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{story.timeAgo}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  ✅ Found: {story.item}
                </span>
              </div>
              <CardDescription className="text-gray-700 leading-relaxed text-base">
                "{story.story}"
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16 p-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl text-white shadow-2xl">
        <h3 className="text-3xl font-bold mb-4">Your Story Could Be Next!</h3>
        <p className="text-gray-300 mb-6 text-lg max-w-2xl mx-auto">
          Join thousands of students who have successfully recovered their lost items through our community platform.
        </p>
        <div className="flex items-center justify-center space-x-3 text-base">
          <Heart className="h-5 w-5 fill-current text-emerald-400" />
          <span>Made with care by students, for students</span>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
