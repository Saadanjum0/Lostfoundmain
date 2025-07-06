import { useAuth } from '@/contexts/AuthContext';
import UserDashboard from '@/components/home/UserDashboard';
import Global3DBackground from '@/components/Global3DBackground';
import Header from '@/components/layout/Header';
import { Search, Plus, ArrowRight, Sparkles, MessageCircle, CheckCircle, ArrowDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Mobile How It Works Section
const MobileHowItWorks = React.memo(() => {
  const steps = [
    {
      id: 1,
      icon: Plus,
      title: "Report Item",
      description: "Create a listing with photos and details",
      color: "bg-amber-500/20 border-amber-500/30"
    },
    {
      id: 2,
      icon: Search,
      title: "Search & Browse",
      description: "Find items using filters and search",
      color: "bg-blue-500/20 border-blue-500/30"
    },
    {
      id: 3,
      icon: MessageCircle,
      title: "Connect Safely",
      description: "Message securely to verify ownership",
      color: "bg-green-500/20 border-green-500/30"
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Happy Reunion",
      description: "Meet safely and reunite with items",
      color: "bg-purple-500/20 border-purple-500/30"
    }
  ];

  return (
    <section className="py-12 px-4 bg-transparent">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 font-['Poppins']">
            How It Works
          </h2>
          <p className="text-gray-400 text-sm font-['Inter']">
            Simple 4-step process to reunite items
          </p>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className={`p-4 rounded-xl border ${step.color} bg-black/40 backdrop-blur-sm`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                        Step {step.id}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 font-['Poppins']">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-xs font-['Inter']">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link 
            to="/how-it-works" 
            className="inline-flex items-center gap-2 text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
});

// Simplified hero section for mobile
const MobileHeroSection = React.memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-start justify-center px-4 overflow-hidden pt-8 sm:pt-16"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`
      }}
    >
      <div className="max-w-4xl mx-auto text-center relative z-10 mt-8 sm:mt-16">
        <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
          {/* Enhanced Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 premium-card text-white rounded-full animate-fade-in-up [--animation-delay:200ms]">
            <Sparkles className="w-4 h-4 text-amber-400 icon-hover" />
            <span className="text-sm sm:text-base font-medium font-['Poppins']">
              Reuniting People with Their Belongings
            </span>
          </div>
          
          {/* Hero Title */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight animate-fade-in-up [--animation-delay:400ms]">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Lost & Found
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed animate-fade-in-up [--animation-delay:600ms] font-['Inter'] font-light px-4">
              Your trusted community platform for reuniting lost items with their owners. 
              <span className="text-amber-400 font-medium"> Every item has a story.</span>
            </p>
          </div>

          {/* Report Lost/Found Buttons */}
          <div className="flex flex-col gap-3 justify-center items-center animate-fade-in-up [--animation-delay:800ms] px-4 mt-4">
            <Link to="/report/lost" className="elegant-button button-lost px-5 py-2.5 text-sm font-semibold min-w-[160px] group w-full max-w-[200px]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 icon-hover" />
                Report Lost Item
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/report/found" className="elegant-button button-found px-5 py-2.5 text-sm font-semibold min-w-[160px] group w-full max-w-[200px]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Search className="w-4 h-4 icon-hover" />
                I Found Something
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Simplified Stats - Single Line, Smaller */}
          <div className="flex justify-center items-center gap-6 sm:gap-8 mt-6 animate-fade-in-up [--animation-delay:1000ms] px-4">
            <div className="text-center group">
              <div className="text-lg sm:text-xl font-bold text-amber-400 mb-1 group-hover:scale-110 transition-transform">1,247+</div>
              <div className="text-gray-400 text-xs font-['Inter']">Items Reunited</div>
            </div>
            <div className="text-center group">
              <div className="text-lg sm:text-xl font-bold text-emerald-400 mb-1 group-hover:scale-110 transition-transform">24hr</div>
              <div className="text-gray-400 text-xs font-['Inter']">Avg Recovery</div>
            </div>
            <div className="text-center group">
              <div className="text-lg sm:text-xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform">98%</div>
              <div className="text-gray-400 text-xs font-['Inter']">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Particles */}
      <div className="floating-particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </section>
  );
});

export default function MobileIndex() {
  const { user, profile } = useAuth();

  // Navigation glitch prevention
  useEffect(() => {
    // Force immediate background application
    const applyBackground = () => {
      const elements = [document.documentElement, document.body, document.getElementById('root')];
      elements.forEach(el => {
        if (el) {
          el.style.background = 'radial-gradient(ellipse at center, #1a1a1a 0%, #141414 30%, #0f0f0f 70%, #0a0a0a 100%)';
          el.style.backgroundColor = '#0a0a0a';
        }
      });
    };

    applyBackground();
    
    // Prevent any flash during route transitions
    const handleRouteChange = () => {
      applyBackground();
    };

    window.addEventListener('beforeunload', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <div className="min-h-screen relative bg-black" style={{ 
      background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #141414 30%, #0f0f0f 70%, #0a0a0a 100%)',
      backgroundAttachment: 'fixed' 
    }}>
      <Header />
      <Global3DBackground />
      
      <main className="relative z-20">
        {!user ? (
          <>
            <MobileHeroSection />
            <MobileHowItWorks />
          </>
        ) : (
          <div className="container mx-auto px-4 py-8 bg-transparent">
            <UserDashboard />
          </div>
        )}
      </main>
    </div>
  );
} 