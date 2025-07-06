import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SplitText from '@/components/ui/SplitText';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <SplitText
          text="404"
          className="text-4xl font-bold mb-4"
          delay={150}
          duration={0.8}
          ease="power2.out"
          splitType="chars"
          from={{ opacity: 0, y: 50, scale: 1.2 }}
          to={{ opacity: 1, y: 0, scale: 1 }}
          threshold={0.3}
          rootMargin="-100px"
          textAlign="center"
        />
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
