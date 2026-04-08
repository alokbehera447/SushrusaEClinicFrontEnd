// Mobile device detection utility
export const isMobileDevice = (): boolean => {
  // Check for mobile user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i
  ];
  
  // Check if any mobile pattern matches
  const isMobileUserAgent = mobilePatterns.some(pattern => pattern.test(userAgent));
  
  // Check screen size (additional check for tablets in desktop mode)
  const isMobileScreen = window.innerWidth <= 768;
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Return true if it's a mobile user agent OR (mobile screen AND touch device)
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

// Hook for React components
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return isMobile;
};

// Import React for the hook
import React from 'react';
