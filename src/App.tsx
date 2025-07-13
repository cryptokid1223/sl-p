import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage';
import NewsPage from './components/NewsPage';
import ArticlePage from './components/ArticlePage';
import { NewsProvider } from './context/NewsContext'

function App() {
  return (
    <NewsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
          </Routes>
        </div>
      </Router>
    </NewsProvider>
  )
}

export default App 