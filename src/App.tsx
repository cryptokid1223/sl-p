import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage';
import NewsPage from './components/NewsPage';
import ArticlePage from './components/ArticlePage';
import NotFoundPage from './components/NotFoundPage';
import { NewsProvider } from './context/NewsContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { useRouteFix } from './hooks/useRouteFix';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  useRouteFix();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
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