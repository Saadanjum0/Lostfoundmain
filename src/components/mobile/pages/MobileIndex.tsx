import { useAuth } from '@/contexts/AuthContext';
import UserDashboard from '@/components/home/UserDashboard';
import Global3DBackground from '@/components/Global3DBackground';
import Header from '@/components/layout/Header';
import { Search, Plus, ArrowRight, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)`
      }}
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="space-y-6 animate-fade-in-up">
          {/* Enhanced Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 premium-card text-white rounded-full animate-fade-in-up [--animation-delay:200ms]">
            <Sparkles className="w-4 h-4 text-amber-400 icon-hover" />
            <span className="text-sm sm:text-base font-medium font-['Poppins']">
              Reuniting People with Their Belongings
            </span>
          </div>
          
          {/* Hero Title */}
          <div className="space-y-3">
            <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-none animate-fade-in-up [--animation-delay:400ms]">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Lost & Found
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [--animation-delay:600ms] font-['Inter'] font-light px-4">
              Your trusted community platform for reuniting lost items with their owners. 
              <span className="text-amber-400 font-medium"> Every item has a story. Every reunion brings joy.</span>
            </p>
          </div>

          {/* Report Lost/Found Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up [--animation-delay:800ms] px-4">
            <Link to="/report/lost" className="elegant-button button-lost px-6 py-3 text-base font-semibold min-w-[180px] group">
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="w-4 h-4 icon-hover" />
                Report Lost Item
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/report/found" className="elegant-button button-found px-6 py-3 text-base font-semibold min-w-[180px] group">
              <span className="relative z-10 flex items-center gap-2">
                <Search className="w-4 h-4 icon-hover" />
                I Found Something
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Simplified Stats - Single Line, Smaller */}
          <div className="flex justify-center items-center gap-8 mt-12 animate-fade-in-up [--animation-delay:1000ms] px-4">
            <div className="text-center group">
              <div className="text-xl font-bold text-amber-400 mb-1 group-hover:scale-110 transition-transform">1,247+</div>
              <div className="text-gray-400 text-xs font-['Inter']">Items Reunited</div>
            </div>
            <div className="text-center group">
              <div className="text-xl font-bold text-emerald-400 mb-1 group-hover:scale-110 transition-transform">24hr</div>
              <div className="text-gray-400 text-xs font-['Inter']">Avg Recovery</div>
            </div>
            <div className="text-center group">
              <div className="text-xl font-bold text-blue-400 mb-1 group-hover:scale-110 transition-transform">98%</div>
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

  return (
    <div className="min-h-screen relative">
      <Header />
      <Global3DBackground />
      
      <main className="relative z-20">
        {!user ? (
          <MobileHeroSection />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <UserDashboard />
          </div>
        )}
      </main>
    </div>
  );
} 