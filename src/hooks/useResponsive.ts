import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    // Initial call
    updateDimensions();

    // Add event listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return state;
};

// Utility functions for responsive design
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const;

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.mobile;
};

export const isTabletDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.mobile && window.innerWidth < breakpoints.tablet;
};

export const isDesktopDevice = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= breakpoints.tablet;
}; 