import React, { memo } from 'react';
import { 
  Smartphone, Briefcase, Key, Headphones, Watch, Camera, 
  Wallet, Backpack, Laptop, BookOpen, Glasses, Calculator
} from 'lucide-react';

interface Global3DBackgroundProps {
  maxHeight?: string;
  showOnlyOnHero?: boolean;
}

const Global3DBackground: React.FC<Global3DBackgroundProps> = memo(({ 
  maxHeight = "100vh", 
  showOnlyOnHero = false 
}) => {
  // Reduced and optimized floating items for better performance
  const universityItems = [
    { icon: <Smartphone />, name: "Phone", color: "from-blue-500 to-blue-600", size: "w-12 h-12" },
    { icon: <Briefcase />, name: "Briefcase", color: "from-gray-600 to-gray-700", size: "w-14 h-14" },
    { icon: <Key />, name: "Keys", color: "from-yellow-500 to-yellow-600", size: "w-10 h-10" },
    { icon: <Headphones />, name: "Headphones", color: "from-purple-500 to-purple-600", size: "w-12 h-12" },
    { icon: <Watch />, name: "Watch", color: "from-green-500 to-green-600", size: "w-11 h-11" },
    { icon: <Camera />, name: "Camera", color: "from-red-500 to-red-600", size: "w-13 h-13" },
    { icon: <Wallet />, name: "Wallet", color: "from-brown-500 to-brown-600", size: "w-12 h-12" },
    { icon: <Backpack />, name: "Backpack", color: "from-indigo-500 to-indigo-600", size: "w-14 h-14" },
    { icon: <Laptop />, name: "Laptop", color: "from-gray-500 to-gray-600", size: "w-15 h-15" },
    { icon: <BookOpen />, name: "Book", color: "from-orange-500 to-orange-600", size: "w-12 h-12" },
    { icon: <Glasses />, name: "Glasses", color: "from-teal-500 to-teal-600", size: "w-11 h-11" },
    { icon: <Calculator />, name: "Calculator", color: "from-pink-500 to-pink-600", size: "w-10 h-10" }
  ];

  // Optimized positions with better spacing - reduced from 26 to 12 items
  const optimizedPositions = [
    { top: '15%', left: '10%', animation: 'floatGentle1 14s ease-in-out infinite' },
    { top: '25%', left: '85%', animation: 'floatGentle2 16s ease-in-out infinite 2s' },
    { top: '35%', left: '20%', animation: 'floatGentle3 15s ease-in-out infinite 4s' },
    { top: '45%', left: '75%', animation: 'floatGentle4 17s ease-in-out infinite 6s' },
    { top: '55%', left: '15%', animation: 'floatGentle5 14.5s ease-in-out infinite 8s' },
    { top: '65%', left: '80%', animation: 'floatGentle6 16.5s ease-in-out infinite 10s' },
    { top: '75%', left: '25%', animation: 'floatGentle1 15.5s ease-in-out infinite 12s' },
    { top: '20%', left: '50%', animation: 'floatGentle2 14s ease-in-out infinite 3s' },
    { top: '40%', left: '45%', animation: 'floatGentle3 16s ease-in-out infinite 5s' },
    { top: '60%', left: '55%', animation: 'floatGentle4 15s ease-in-out infinite 7s' },
    { top: '30%', left: '65%', animation: 'floatGentle5 15.5s ease-in-out infinite 9s' },
    { top: '70%', left: '35%', animation: 'floatGentle6 17s ease-in-out infinite 11s' }
  ];

  return (
    <div 
      className="fixed top-0 left-0 right-0 overflow-hidden pointer-events-none z-0"
      style={{ height: maxHeight }}
    >
      {/* Optimized floating items with better performance */}
      {universityItems.map((item, index) => {
        const position = optimizedPositions[index];
        return (
          <div
            key={`${item.name}-${index}`}
            className={`absolute ${item.size} enhanced-floating-item glow-effect 
                       bg-gradient-to-br ${item.color} 
                       rounded-2xl flex items-center justify-center text-2xl
                       border border-white/20 backdrop-blur-sm
                       opacity-30 hover:opacity-60 transition-all duration-500
                       shadow-lg hover:shadow-2xl`}
            style={{
              top: position.top,
              left: position.left,
              animation: position.animation,
              willChange: 'transform'
            }}
            title={item.name}
          >
            {item.icon}
          </div>
        );
      })}

      {/* Reduced ambient particles for better performance */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-white/10 rounded-full blur-sm"
          style={{
            top: `${20 + (i * 15)}%`,
            left: `${10 + (i * 15)}%`,
            animation: `particleFloat ${12 + (i * 2)}s ease-in-out infinite ${i * 2}s`,
            willChange: 'transform, opacity'
          }}
        />
      ))}

      {/* Static gradient orbs for ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl opacity-50" />
    </div>
  );
});

Global3DBackground.displayName = 'Global3DBackground';

export default Global3DBackground; 