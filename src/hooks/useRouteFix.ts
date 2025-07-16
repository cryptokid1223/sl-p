import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRouteFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // BULLETPROOF CLIENT-SIDE ROUTING FIXES
    
    // Store current path for recovery
    sessionStorage.setItem('currentPath', location.pathname);
    sessionStorage.setItem('currentPathTime', Date.now().toString());
    
    // Safari mobile specific handling
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isSafari && isMobile) {
      // Store current path for recovery
      sessionStorage.setItem('lastPath', location.pathname);
      sessionStorage.setItem('lastPathTime', Date.now().toString());
      
      // Handle page visibility change (when user returns to tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const lastPath = sessionStorage.getItem('lastPath');
          const currentPath = window.location.pathname;
          
          // If we're not on a valid route, redirect to home
          if (currentPath !== '/' && 
              currentPath !== '/news' && 
              !currentPath.startsWith('/article/')) {
            window.location.replace('/');
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Handle beforeunload for Safari mobile
      const handleBeforeUnload = () => {
        sessionStorage.setItem('lastPath', location.pathname);
        sessionStorage.setItem('lastPathTime', Date.now().toString());
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [location.pathname, navigate]);

  // Handle direct URL access for all browsers
  useEffect(() => {
    const currentPath = window.location.pathname;
    const validRoutes = ['/', '/news'];
    const isArticleRoute = currentPath.startsWith('/article/');
    const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(currentPath);
    
    // If we're not on a valid route and not requesting an asset, redirect to home
    if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
      // Store the intended path for potential recovery
      sessionStorage.setItem('intendedPath', currentPath);
      sessionStorage.setItem('redirectTime', Date.now().toString());
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Handle popstate events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;
      const validRoutes = ['/', '/news'];
      const isArticleRoute = currentPath.startsWith('/article/');
      const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(currentPath);
      
      if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash && window.location.pathname === '/') {
        window.location.reload();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Additional safety check after component mounts
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentPath = window.location.pathname;
      const validRoutes = ['/', '/news'];
      const isArticleRoute = currentPath.startsWith('/article/');
      const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(currentPath);
      
      if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
        navigate('/', { replace: true });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [navigate]);
}; 