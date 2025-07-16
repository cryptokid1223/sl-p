import { useParams, useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Calendar, User, MessageCircle, Bookmark, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useUserPreferences } from '../context/UserPreferencesContext';

export default function ArticlePage() {
  const { id } = useParams();
  const { articles, loading } = useArticles();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, addBookmark, removeBookmark, isBookmarked, updateReadingProgress, getReadingProgress } = useUserPreferences();
  const article = articles.find(a => a.id === id);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Comments logic
  const { comments, loading: commentsLoading, error: commentsError, fetchComments, addComment } = useComments(id!);
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchComments();
    // eslint-disable-next-line
  }, [id]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !article) return;
      
      const element = contentRef.current;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the content has been scrolled past
      const scrolled = Math.max(0, windowHeight - elementTop);
      const progress = Math.min(100, (scrolled / (elementHeight + windowHeight)) * 100);
      
      setReadingProgress(progress);
      
      // Update reading progress in context
      updateReadingProgress(article.id, progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, updateReadingProgress]);

  function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime;
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!article) return;
    try {
      if (isBookmarked(article.id)) {
        await removeBookmark(article.id);
      } else {
        await addBookmark(article.id, article.title, article.category);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Show user-friendly error message
      alert('Failed to save bookmark. Please try again.');
    }
  };

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);
    if (wordCount(commentContent) > 50) {
      setCommentError('Comment must be 50 words or less.');
      return;
    }
    setSubmitting(true);
    try {
      await addComment({ content: commentContent, author: commentAuthor || 'Anonymous' });
      setCommentContent('');
      setCommentAuthor('');
    } catch (err: any) {
      setCommentError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300 text-lg">Loading...</div>
    </div>
  );
  
  if (!article) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-red-500 dark:text-red-400 text-lg">Article not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
        <div 
          className="h-full bg-gray-900 dark:bg-white transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Back Button */}
            <button
              onClick={() => navigate('/news')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 36 36" fill="none" className="text-white">
                  <path d="M10 10 L18 26 L26 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
                  <circle cx="18" cy="14" r="1.5" fill="currentColor" opacity="0.8"/>
                  <line x1="12" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                  <line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-light text-gray-900 dark:text-white tracking-wider">VLEEB</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300 font-medium tracking-[0.2em] uppercase">News Articles</p>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600' 
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 border border-yellow-300'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                  isDarkMode 
                    ? 'translate-x-7 bg-gray-700 border border-gray-500' 
                    : 'translate-x-1 bg-white border border-yellow-200'
                }`}
              >
                {!isDarkMode && (
                  <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
                {isDarkMode && (
                  <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </span>
              <span className="sr-only">Toggle dark mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(article.created_at), 'EEEE, MMMM d, yyyy')}
              </div>
              {article.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  By {article.author}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {calculateReadingTime(article.content)} min read
              </div>
            </div>
            
            {/* Bookmark Button */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-3 rounded-lg transition-colors ${
                isBookmarked(article.id)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={isBookmarked(article.id) ? 'Remove from bookmarks' : 'Add to bookmarks'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked(article.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            {article.title}
          </h1>
        </div>

        {/* Featured Image */}
        {article.image_url && (
          <div className="mb-8">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div ref={contentRef} className="prose prose-lg max-w-none mb-12 dark:prose-invert">
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Article Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-12">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-4">
              <span>Published {format(new Date(article.created_at), 'MMM dd, yyyy')}</span>
              {article.author && <span>• By {article.author}</span>}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide">
              {article.category}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Comments</h3>
          </div>
          
          {commentsLoading ? (
            <div className="text-gray-600 dark:text-gray-300 py-8 text-center">Loading comments...</div>
          ) : commentsError ? (
            <div className="text-red-500 dark:text-red-400 py-8 text-center">{commentsError}</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300 py-8 text-center">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-6 mb-8">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-800 dark:text-gray-200 text-base mb-3 leading-relaxed">
                    {comment.content}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">By {comment.author || 'Anonymous'}</span>
                    <span>{format(new Date(comment.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Comment Form */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add a Comment</h4>
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <textarea
                  name="content"
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-colors resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  maxLength={400}
                  placeholder="Write your comment (max 50 words)..."
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="author"
                  value={commentAuthor}
                  onChange={e => setCommentAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Your name (optional)"
                />
              </div>
              {commentError && (
                <div className="text-red-500 dark:text-red-400 text-sm">{commentError}</div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 