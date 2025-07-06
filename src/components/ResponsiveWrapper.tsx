import { ReactNode } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveWrapperProps {
  desktopComponent: ReactNode;
  mobileComponent: ReactNode;
  tabletComponent?: ReactNode;
}

export default function ResponsiveWrapper({ 
  desktopComponent, 
  mobileComponent, 
  tabletComponent 
}: ResponsiveWrapperProps) {
  const { isMobile, isTablet } = useResponsive();

  // Priority: Mobile -> Tablet -> Desktop
  if (isMobile) {
    return <>{mobileComponent}</>;
  }
  
  if (isTablet && tabletComponent) {
    return <>{tabletComponent}</>;
  }
  
  return <>{desktopComponent}</>;
}

// Alternative approach with render props for more flexibility
interface ResponsiveRenderProps {
  children: (state: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }) => ReactNode;
}

export function ResponsiveRender({ children }: ResponsiveRenderProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return <>{children({ isMobile, isTablet, isDesktop })}</>;
}

// HOC for wrapping components with responsive behavior
export function withResponsive<T extends object>(
  DesktopComponent: React.ComponentType<T>,
  MobileComponent: React.ComponentType<T>,
  TabletComponent?: React.ComponentType<T>
) {
  return function ResponsiveComponent(props: T) {
    const { isMobile, isTablet } = useResponsive();
    
    if (isMobile) {
      return <MobileComponent {...props} />;
    }
    
    if (isTablet && TabletComponent) {
      return <TabletComponent {...props} />;
    }
    
    return <DesktopComponent {...props} />;
  };
} 