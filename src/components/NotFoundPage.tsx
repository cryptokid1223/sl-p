import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-white">
              <path d="M10 10 L18 26 L26 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
              <circle cx="18" cy="14" r="1.5" fill="currentColor" opacity="0.8"/>
              <line x1="12" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-900 dark:text-white tracking-wider">VLEEB</h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 font-medium tracking-[0.2em] uppercase mt-1">News Platform</p>
          </div>
        </div>

        {/* 404 Content */}
        <div className="mb-8">
          <h2 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h2>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Page Not Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to reading the latest news.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Go to Homepage</span>
          </button>
          
          <button
            onClick={() => navigate('/news')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Browse News</span>
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 px-4 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 