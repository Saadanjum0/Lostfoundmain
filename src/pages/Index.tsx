import { useAuth } from '../contexts/AuthContext';
import SimpleDashboard from '../components/home/SimpleDashboard';
import UserDashboard from '../components/home/UserDashboard';
import Global3DBackground from '../components/Global3DBackground';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Search, Plus, Star, TrendingUp, Users, Heart, ArrowRight, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import MobileIndex from '../components/mobile/pages/MobileIndex';
import MobileUserDashboard from '../components/mobile/home/MobileUserDashboard';

// Memoized components for performance
const HeroSection = React.memo(() => {
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
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          {/* Enhanced Hero Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 premium-card text-white rounded-full animate-fade-in-up [--animation-delay:200ms]">
            <Sparkles className="w-4 h-4 text-amber-400 icon-hover" />
            <span className="text-base sm:text-lg font-medium font-['Poppins']">
              Reuniting People with Their Belongings
            </span>
              </div>
              
          {/* Hero Title with Enhanced Typography */}
          <div className="space-y-4">
            <h1 className="hero-title text-6xl sm:text-8xl lg:text-9xl font-extrabold text-white leading-none animate-fade-in-up [--animation-delay:400ms]">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Lost & Found
              </span>
              </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [--animation-delay:600ms] font-['Inter'] font-light">
              Your trusted community platform for reuniting lost items with their owners. 
              <span className="text-amber-400 font-medium"> Every item has a story. Every reunion brings joy.</span>
              </p>
            </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up [--animation-delay:800ms]">
            <Link to="/report/lost" className="elegant-button button-lost px-8 py-4 text-lg font-semibold min-w-[200px] group">
              <span className="relative z-10 flex items-center gap-3">
                <Plus className="w-5 h-5 icon-hover" />
                Report Lost Item
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/report/found" className="elegant-button button-found px-8 py-4 text-lg font-semibold min-w-[200px] group">
              <span className="relative z-10 flex items-center gap-3">
                <Search className="w-5 h-5 icon-hover" />
                I Found Something
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Enhanced Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16 animate-fade-in-up [--animation-delay:1000ms]">
            <div className="text-center group">
              <div className="text-3xl font-bold text-amber-400 mb-2 group-hover:scale-110 transition-transform">1,247+</div>
              <div className="text-gray-400 text-sm font-['Inter']">Items Successfully Reunited</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform">24hr</div>
              <div className="text-gray-400 text-sm font-['Inter']">Average Recovery Time</div>
              </div>
            <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform">98%</div>
              <div className="text-gray-400 text-sm font-['Inter']">Community Satisfaction</div>
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

export default function Index() {
  const { user, profile } = useAuth();

  // Desktop version (original)
  const DesktopIndex = () => (
    <div className="min-h-screen relative">
      <Header />
      <Global3DBackground />
      
      <main className="relative z-20">
        {!user ? (
          <HeroSection />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <UserDashboard />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );

  return (
    <ResponsiveWrapper
      desktopComponent={<DesktopIndex />}
      mobileComponent={user ? <MobileUserDashboard /> : <MobileIndex />}
    />
  );
}
