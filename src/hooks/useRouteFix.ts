import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRouteFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle mobile Safari refresh issues
    const handleBeforeUnload = () => {
      // Store the current path before page unload
      sessionStorage.setItem('lastPath', location.pathname);
    };

    const handleLoad = () => {
      // Check if we're on a route that might cause issues
      const lastPath = sessionStorage.getItem('lastPath');
      const currentPath = window.location.pathname;
      
      // If we're on a route that doesn't match our expected routes, redirect to home
      if (currentPath !== '/' && 
          currentPath !== '/news' && 
          !currentPath.startsWith('/article/') &&
          lastPath !== currentPath) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, [location.pathname, navigate]);

  // Handle direct URL access
  useEffect(() => {
    const currentPath = window.location.pathname;
    const validRoutes = ['/', '/news'];
    const isArticleRoute = currentPath.startsWith('/article/');
    
    if (!validRoutes.includes(currentPath) && !isArticleRoute) {
      // If it's not a valid route, redirect to home
      navigate('/', { replace: true });
    }
  }, [navigate]);
}; 