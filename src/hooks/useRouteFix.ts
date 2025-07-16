import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRouteFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Simple Safari mobile refresh handling
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isSafari && isMobile) {
      // Store current path for recovery
      sessionStorage.setItem('lastPath', location.pathname);
      
      // Handle page visibility change (when user returns to tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const lastPath = sessionStorage.getItem('lastPath');
          const currentPath = window.location.pathname;
          
          // If we're not on a valid route, redirect to home
          if (currentPath !== '/' && 
              currentPath !== '/news' && 
              !currentPath.startsWith('/article/')) {
            navigate('/', { replace: true });
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [location.pathname, navigate]);

  // Handle direct URL access for all browsers
  useEffect(() => {
    const currentPath = window.location.pathname;
    const validRoutes = ['/', '/news'];
    const isArticleRoute = currentPath.startsWith('/article/');
    
    // If we're not on a valid route, redirect to home
    if (!validRoutes.includes(currentPath) && !isArticleRoute) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
}; 