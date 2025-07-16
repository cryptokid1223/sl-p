import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage';
import NewsPage from './components/NewsPage';
import ArticlePage from './components/ArticlePage';
import NotFoundPage from './components/NotFoundPage';
import { NewsProvider } from './context/NewsContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { useRouteFix } from './hooks/useRouteFix';
import { useEffect, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  useRouteFix();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle Safari mobile refresh issues
    const handleInitialLoad = () => {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isSafari && isMobile) {
        // Small delay to ensure routing is properly initialized
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      } else {
        setIsLoading(false);
      }
    };

    handleInitialLoad();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          {/* Handle common 404 scenarios */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
          {/* Catch-all route to handle 404s */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <UserPreferencesProvider>
      <NewsProvider>
        <Router>
          <AppContent />
        </Router>
      </NewsProvider>
    </UserPreferencesProvider>
  )
}

export default App 