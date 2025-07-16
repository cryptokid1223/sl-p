import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRouteFix = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Safari mobile specific handling
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Store current path for Safari mobile
    if (isSafari && isMobile) {
      sessionStorage.setItem('lastPath', location.pathname);
      localStorage.setItem('lastPath', location.pathname);
    }

    // Handle page visibility change (Safari mobile specific)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSafari && isMobile) {
        const lastPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
        const currentPath = window.location.pathname;
        
        // If the current path doesn't match our expected routes, redirect
        if (currentPath !== '/' && 
            currentPath !== '/news' && 
            !currentPath.startsWith('/article/') &&
            lastPath && lastPath !== currentPath) {
          navigate(lastPath, { replace: true });
        }
      }
    };

    // Handle beforeunload for Safari mobile
    const handleBeforeUnload = () => {
      if (isSafari && isMobile) {
        sessionStorage.setItem('lastPath', location.pathname);
        localStorage.setItem('lastPath', location.pathname);
      }
    };

    // Handle page load for Safari mobile
    const handleLoad = () => {
      if (isSafari && isMobile) {
        const lastPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
        const currentPath = window.location.pathname;
        
        // If we're on a route that doesn't match our expected routes, redirect to home
        if (currentPath !== '/' && 
            currentPath !== '/news' && 
            !currentPath.startsWith('/article/') &&
            lastPath !== currentPath) {
          navigate('/', { replace: true });
        }
      }
    };

    // Handle popstate for Safari mobile
    const handlePopState = (event: PopStateEvent) => {
      if (isSafari && isMobile) {
        const lastPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
        if (lastPath && lastPath !== window.location.pathname) {
          navigate(lastPath, { replace: true });
        }
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  // Handle direct URL access and 404s
  useEffect(() => {
    const currentPath = window.location.pathname;
    const validRoutes = ['/', '/news'];
    const isArticleRoute = currentPath.startsWith('/article/');
    
    // Check if we're on a valid route
    if (!validRoutes.includes(currentPath) && !isArticleRoute) {
      // Check if this might be a Safari mobile refresh issue
      const lastPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
      
      if (lastPath && (lastPath === '/' || lastPath === '/news' || lastPath.startsWith('/article/'))) {
        // Redirect to the last known valid path
        navigate(lastPath, { replace: true });
      } else {
        // Redirect to home if no valid last path
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  // Additional 404 handling for Vercel
  useEffect(() => {
    // Check if we're on a 404 page (Vercel shows this)
    const is404Page = document.title.includes('404') || 
                     document.title.includes('NOT_FOUND') ||
                     window.location.pathname.includes('404') ||
                     document.body.textContent?.includes('NOT_FOUND');
    
    if (is404Page) {
      const lastPath = sessionStorage.getItem('lastPath') || localStorage.getItem('lastPath');
      
      if (lastPath && (lastPath === '/' || lastPath === '/news' || lastPath.startsWith('/article/'))) {
        // Redirect to the last known valid path
        navigate(lastPath, { replace: true });
      } else {
        // Redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);
}; 