import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MessageCircle, CheckCircle, ArrowRight, Camera, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SplitText from '@/components/ui/SplitText';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: Plus,
      title: "Report Your Item",
      description: "Create a detailed listing with photos, description, and location where you lost or found an item.",
      color: "bg-amber-100 text-amber-800",
      details: [
        "Take clear photos from multiple angles",
        "Provide detailed description including colors, brand, size",
        "Specify the exact location and time",
        "Add your contact information"
      ]
    },
    {
      id: 2,
      icon: Search,
      title: "Search & Browse",
      description: "Browse through listings or use our search filters to find items that match your lost belongings.",
      color: "bg-blue-100 text-blue-800",
      details: [
        "Use category and location filters",
        "Search by keywords or item description",
        "Sort by date, relevance, or location",
        "Set up alerts for specific items"
      ]
    },
    {
      id: 3,
      icon: MessageCircle,
      title: "Connect Safely",
      description: "Use our secure messaging system to contact the other party and verify ownership.",
      color: "bg-green-100 text-green-800",
      details: [
        "Ask verification questions about the item",
        "Arrange a safe meeting location on campus",
        "Share additional photos if needed",
        "Keep all communication within the platform"
      ]
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Happy Reunion",
      description: "Meet safely on campus and reunite with your belongings. Mark the item as resolved.",
      color: "bg-purple-100 text-purple-800",
      details: [
        "Meet in well-lit, public campus areas",
        "Verify the item matches your description",
        "Thank the finder for their honesty",
        "Mark the listing as resolved"
      ]
    }
  ];

  const tips = [
    {
      icon: Camera,
      title: "Quality Photos",
      description: "Clear, well-lit photos from multiple angles help others identify your item quickly."
    },
    {
      icon: MapPin,
      title: "Accurate Location",
      description: "Be as specific as possible about where you lost or found the item."
    },
    {
      icon: Phone,
      title: "Safe Communication",
      description: "Always use our messaging system and meet in public campus locations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-80 h-80 bg-amber-200 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SplitText
            text="How It Works"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            delay={120}
            duration={0.7}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 50, rotationY: 20 }}
            to={{ opacity: 1, y: 0, rotationY: 0 }}
            threshold={0.2}
            rootMargin="-80px"
            textAlign="center"
          />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our simple 4-step process makes it easy to reunite lost items with their owners. 
            Join our community of honest students helping each other.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <Card className="h-full border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    <Badge variant="outline" className="w-fit mx-auto mb-2">
                      Step {step.id}
                    </Badge>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4 text-center">
                      {step.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Arrow connector */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pro Tips for Success</h2>
            <p className="text-lg text-gray-600">
              Follow these best practices to increase your chances of a successful reunion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tips.map((tip, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <tip.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and help reunite lost items with their owners
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-amber-600 hover:bg-gray-100">
              <Link to="/report/lost">
                <Plus className="w-5 h-5 mr-2" />
                Report Lost Item
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/items/browse">
                <Search className="w-5 h-5 mr-2" />
                Browse Items
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks; 