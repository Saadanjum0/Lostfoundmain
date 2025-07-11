import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../components/home/UserDashboard';
import Global3DBackground from '../components/Global3DBackground';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Search, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResponsiveWrapper from '../components/ResponsiveWrapper';
import MobileIndex from '../components/mobile/pages/MobileIndex';
import MobileUserDashboard from '../components/mobile/home/MobileUserDashboard';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 premium-card text-white rounded-full">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-base sm:text-lg font-medium">
              Reuniting People with Their Belongings
            </span>
          </div>
              
          <div className="space-y-4">
            <h1 className="hero-title text-6xl sm:text-8xl lg:text-9xl font-extrabold text-white leading-none">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Lost & Found
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Your trusted community platform for reuniting lost items with their owners. 
              <span className="text-amber-400 font-medium"> Every item has a story. Every reunion brings joy.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/report/lost" className="elegant-button button-lost px-8 py-4 text-lg font-semibold min-w-[200px] group">
              <span className="relative z-10 flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Report Lost Item
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/report/found" className="elegant-button button-found px-8 py-4 text-lg font-semibold min-w-[200px] group">
              <span className="relative z-10 flex items-center gap-3">
                <Search className="w-5 h-5" />
                I Found Something
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">1,247+</div>
              <div className="text-gray-400 text-sm">Items Successfully Reunited</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">24hr</div>
              <div className="text-gray-400 text-sm">Average Recovery Time</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
              <div className="text-gray-400 text-sm">Community Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Index() {
  const { user } = useAuth();

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
