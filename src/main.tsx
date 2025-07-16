import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Robust initialization for routing
(function initializeApp() {
  // Handle any routing issues before React loads
  const currentPath = window.location.pathname;
  const validRoutes = ['/', '/news'];
  const isArticleRoute = currentPath.startsWith('/article/');
  
  // If we're not on a valid route, redirect to home
  if (!validRoutes.includes(currentPath) && !isArticleRoute) {
    // Store the intended path for potential recovery
    sessionStorage.setItem('intendedPath', currentPath);
    window.location.replace('/');
    return; // Don't render React if we're redirecting
  }
  
  // Handle Safari mobile specific issues
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isSafari && isMobile) {
    // Store current path for recovery
    sessionStorage.setItem('lastPath', currentPath);
    
    // Add visibility change handler for Safari mobile
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        const lastPath = sessionStorage.getItem('lastPath');
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/' && 
            currentPath !== '/news' && 
            !currentPath.startsWith('/article/')) {
          window.location.replace('/');
        }
      }
    });
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 