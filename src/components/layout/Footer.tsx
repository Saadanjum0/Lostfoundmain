
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Heart } from 'lucide-react';
import SplitText from '@/components/ui/SplitText';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dark-gradient text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-24 left-24 w-80 h-80 bg-yellow-200 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-16 right-40 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {/* Brand with elegant styling */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-3xl flex items-center justify-center shadow-xl">
                  <span className="text-black font-bold text-xl">LF</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full animate-pulse-slow"></div>
              </div>
              <span className="text-2xl font-bold">Campus Lost & Found</span>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed text-lg">
              An elegant approach to helping students reconnect with their belongings through our sophisticated platform.
            </p>
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="h-5 w-5 mr-3 text-yellow-300" />
              University Campus
            </div>
          </div>

          {/* Quick Links with elegant hover effects */}
          <div>
            <h3 className="text-xl font-bold mb-8 text-white relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-yellow-300 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Browse Items', href: '/items/browse' },
                { name: 'Lost Items', href: '/items/lost' },
                { name: 'Found Items', href: '/items/found' },
                { name: 'How It Works', href: '/how-it-works' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 transform inline-block relative group text-lg"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-300 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-xl font-bold mb-8 text-white relative">
              Account
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-yellow-300 rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'Sign Up', href: '/auth/register' },
                { name: 'Sign In', href: '/auth/login' },
                { name: 'Report Lost Item', href: '/report/lost' },
                { name: 'Report Found Item', href: '/report/found' }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-2 transform inline-block relative group text-lg"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-300 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact with elegant cards */}
          <div>
            <h3 className="text-xl font-bold mb-8 text-white relative">
              Contact
              <span className="absolute bottom-0 left-0 w-12 h-1 bg-yellow-300 rounded-full"></span>
            </h3>
            <ul className="space-y-5">
              <li className="flex items-center text-gray-300 p-4 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                <Mail className="h-5 w-5 mr-4 text-yellow-300" />
                help@campuslostfound.edu
              </li>
              <li className="flex items-center text-gray-300 p-4 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                <Phone className="h-5 w-5 mr-4 text-yellow-300" />
                (555) 123-4567
              </li>
              <li className="flex items-center text-gray-300 p-4 bg-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                <MapPin className="h-5 w-5 mr-4 text-yellow-300" />
                Student Services Center
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section with elegant styling */}
        <div className="border-t border-white/20 mt-16 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg flex items-center">
              © {currentYear} Campus Lost & Found. Made with{' '}
              <Heart className="h-5 w-5 mx-2 text-yellow-300 animate-pulse" />
              for students.
            </p>
            <div className="flex space-x-10 mt-6 md:mt-0">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link) => (
                <Link 
                  key={link.name}
                  to={link.href} 
                  className="text-gray-300 hover:text-white text-lg transition-all duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-300 transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
