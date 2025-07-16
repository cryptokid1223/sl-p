import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// BULLETPROOF REACT INITIALIZATION
(function initializeReactApp() {
  'use strict';
  
  // Additional safety checks before React loads
  const currentPath = window.location.pathname;
  const validRoutes = ['/', '/news'];
  const isArticleRoute = currentPath.startsWith('/article/');
  const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i.test(currentPath);
  
  // If we're not on a valid route and not requesting an asset, redirect to home
  if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
    // Store the intended path for potential recovery
    sessionStorage.setItem('intendedPath', currentPath);
    sessionStorage.setItem('redirectTime', Date.now().toString());
    window.location.replace('/');
    return; // Don't render React if we're redirecting
  }
  
  // Handle Safari mobile specific issues
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isSafari && isMobile) {
    // Store current path for recovery
    sessionStorage.setItem('lastPath', currentPath);
    sessionStorage.setItem('lastPathTime', Date.now().toString());
    
    // Add visibility change handler for Safari mobile
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        const lastPath = sessionStorage.getItem('lastPath');
        const currentPath = window.location.pathname;
        
        if (currentPath !== '/' && 
            currentPath !== '/news' && 
            !currentPath.startsWith('/article/') &&
            !isAsset) {
          window.location.replace('/');
        }
      }
    });
    
    // Handle beforeunload for Safari mobile
    window.addEventListener('beforeunload', function() {
      sessionStorage.setItem('lastPath', window.location.pathname);
      sessionStorage.setItem('lastPathTime', Date.now().toString());
    });
  }
  
  // Handle popstate events
  window.addEventListener('popstate', function(event) {
    const currentPath = window.location.pathname;
    if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
      window.location.replace('/');
    }
  });
  
  // Force reload on hash change (for some edge cases)
  window.addEventListener('hashchange', function() {
    if (window.location.hash && window.location.pathname === '/') {
      window.location.reload();
    }
  });
  
  // Additional safety check after a short delay
  setTimeout(function() {
    const currentPath = window.location.pathname;
    if (!validRoutes.includes(currentPath) && !isArticleRoute && !isAsset) {
      window.location.replace('/');
    }
  }, 100);
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 