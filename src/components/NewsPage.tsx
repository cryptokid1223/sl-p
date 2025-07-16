import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles';
import { Plus, ArrowLeft, Trash2, Calendar, User, Mail, Instagram, Twitter, Facebook, Youtube, MessageCircle, Share2, ArrowUpRight, ArrowDownRight, X, Bookmark, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import ArticleModal from './ArticleModal'
import React, { useRef, useEffect, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import { supabase } from '../supabaseClient';
import { useUserPreferences } from '../context/UserPreferencesContext';

const ADMIN_EMAIL = 'stokhtabayev@gmail.com';

const categoryOptions = [
  'All',
  'World News',
  'Technology',
  'Politics',
  'Business',
  'Sports',
  'Entertainment',
  'Health',
  'Science',
];

// Crypto data for the ticker
const CRYPTOS = [
  { name: 'VleebCoin', symbol: 'VLB' },
  { name: 'Dogeshit', symbol: 'DOGS' },
  { name: 'QuantumPepe', symbol: 'QPEPE' },
  { name: 'MoonJuice', symbol: 'MOONJ' },
  { name: 'FomoFi', symbol: 'FOMO' },
  { name: 'WAGMI', symbol: 'WAGMI' },
  { name: 'RugPull', symbol: 'RUG' },
  { name: 'ShillToken', symbol: 'SHILL' },
  { name: 'ApeX', symbol: 'APEX' },
  { name: 'PumpETH', symbol: 'PETH' },
];

function getRandomPrice(base: number) {
  return (base + (Math.random() - 0.5) * base * 0.1).toFixed(2);
}

function getRandomChange() {
  return Math.random() > 0.5 ? 1 : -1;
}

const NewsPage = () => {
  const navigate = useNavigate()
  const { articles, loading, error, createArticle, updateArticle, deleteArticle } = useArticles();
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '',
    customCategory: '',
    imageUrl: ''
  })
  const { user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showArticlePreview, setShowArticlePreview] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', author: '', category: '', imageUrl: '' });

  // Crypto ticker state
  const [cryptoPrices, setCryptoPrices] = useState(() =>
    CRYPTOS.map(() => ({ price: getRandomPrice(100), change: getRandomChange() }))
  );
  const [selectedCrypto, setSelectedCrypto] = useState<any | null>(null);
  const [showCryptoChart, setShowCryptoChart] = useState(false);

  // Add refs for preview image and canvas
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update crypto prices
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices(prices =>
        prices.map(({ price }) => {
          const change = getRandomChange();
          const base = parseFloat(price);
          const newPrice = getRandomPrice(base);
          return { price: newPrice, change };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Generate fake chart data
  const generateChartData = (basePrice: number) => {
    const data = [];
    let currentPrice = basePrice;
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 0.1;
      currentPrice = currentPrice * (1 + change);
      data.push({
        time: i,
        price: currentPrice
      });
    }
    return data;
  };

  // Handle crypto click
  const handleCryptoClick = (crypto: any, priceData: any) => {
    setSelectedCrypto({
      ...crypto,
      currentPrice: priceData.price,
      change: priceData.change,
      chartData: generateChartData(parseFloat(priceData.price))
    });
    setShowCryptoChart(true);
  };

  // Draw cropped preview on canvas
  useEffect(() => {
    if (!imagePreview) return;
    const img = previewImgRef.current;
    const canvas = previewCanvasRef.current;
    if (!img || !canvas) return;
    // Set canvas size to preview size (e.g. 400px width)
    const previewWidth = 400;
    const previewHeight = previewWidth; // Fixed height for banner preview
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Draw the cropped area scaled to fit the preview
    ctx.clearRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(
      img,
      0, // x
      0, // y
      previewWidth, // width
      previewHeight, // height
      0,
      0,
      previewWidth,
      previewHeight
    );
  }, [imagePreview]);

  // Add a new state for aspect ratio selection mode
  const [selectingAspect, setSelectingAspect] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<number | undefined>(undefined);

  // Helper to render a preview canvas for a given aspect
  const renderAspectPreview = (aspectValue: number | undefined, label: string) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
      if (!imagePreview) return;
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Set preview size
        const previewWidth = 200;
        const previewHeight = aspectValue ? previewWidth / aspectValue : previewWidth;
        canvas.width = previewWidth;
        canvas.height = previewHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // Center crop for preview
        let cropWidth = img.width;
        let cropHeight = img.height;
        if (aspectValue) {
          if (img.width / img.height > aspectValue) {
            cropWidth = img.height * aspectValue;
            cropHeight = img.height;
          } else {
            cropWidth = img.width;
            cropHeight = img.width / aspectValue;
          }
        }
        const cropX = (img.width - cropWidth) / 2;
        const cropY = (img.height - cropHeight) / 2;
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          previewWidth,
          previewHeight
        );
      };
      img.src = imagePreview;
    }, [imagePreview, aspectValue]);
    return (
      <div style={{ display: 'inline-block', margin: 8, cursor: 'pointer', textAlign: 'center' }} onClick={() => {
        setSelectingAspect(false);
        setSelectedAspect(aspectValue);
      }}>
        <canvas ref={canvasRef} style={{ border: '2px solid #00ffae', borderRadius: 8, background: '#222', width: 200, height: aspectValue ? 200 / aspectValue : 200 }} />
        <div className="text-green-200 text-xs mt-1">{label}</div>
      </div>
    );
  };

  // Get cropped image as blob
  async function getCroppedImg(imageSrc: string, cropPixels: any) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  }

  function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  // Confirm crop and show cropped preview
  const handleCropDone = async () => {
    if (imagePreview) {
      const blob = await getCroppedImg(imagePreview, { x: 0, y: 0, width: 400, height: 128 }); // Fixed size for banner
      if (blob) {
        const fileExt = imageFile?.name.split('.').pop();
        const fileName = `banner_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('banners').upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });
        if (!error && data) {
          const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(data.path);
          setFormData(prev => ({ ...prev, imageUrl: publicUrlData.publicUrl }));
        }
      }
    }
  };

  // Update handleSubmit to show preview instead of publishing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowArticlePreview(true);
  };

  // Add a function to actually publish the article
  const handleFinalPublish = async () => {
    const categoryToUse = formData.category === 'Other' && formData.customCategory
      ? formData.customCategory
      : formData.category;
    await createArticle({
      title: formData.title,
      content: formData.content,
      author: formData.author,
      category: categoryToUse,
      image_url: formData.imageUrl
    });
    setFormData({ title: '', content: '', author: '', category: '', customCategory: '', imageUrl: '' });
    setUploadError(null);
    setShowUploadForm(false);
    setShowArticlePreview(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Add a new state to control whether we are previewing the crop or still cropping
  const [showCropPreview, setShowCropPreview] = useState(false);

  // Add state for expanded article
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);

  function handleEdit(article: any) {
    setEditingArticle(article);
    setEditForm({
      title: article.title,
      content: article.content,
      author: article.author,
      category: article.category,
      imageUrl: article.image_url || ''
    });
  }

  function handleEditInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleEditSave() {
    if (!editingArticle) return;
    await updateArticle(editingArticle.id, {
      title: editForm.title,
      content: editForm.content,
      author: editForm.author,
      category: editForm.category,
      image_url: editForm.imageUrl
    });
    setEditingArticle(null);
  }

  function handleEditCancel() {
    setEditingArticle(null);
  }

  async function handleDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id);
    }
  }

  // Only show Edit/Delete buttons for admin
  const isAdmin = user && user.email === ADMIN_EMAIL;
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const [latestArticle, ...olderArticles] = sortedArticles;

  // Get unique categories from articles
  const availableCategories = ['All', ...Array.from(new Set(articles.map(article => article.category)))];

  // Filter articles by selected category
  const filteredArticles = selectedCategory === 'All' 
    ? sortedArticles 
    : sortedArticles.filter(article => article.category === selectedCategory);

  // Get the latest article from filtered results
  const currentLatestArticle = filteredArticles[0];
  const currentOlderArticles = filteredArticles.slice(1);

  // Mock trending articles for the sidebar (always show from all articles)
  const trendingArticles = olderArticles.slice(0, 3);

  // Duplicate the crypto list for seamless looping
  const displayCryptos = [...CRYPTOS, ...CRYPTOS];
  const displayPrices = [...cryptoPrices, ...cryptoPrices];

  // Handle category navigation
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime;
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent, article: any) => {
    e.stopPropagation();
    
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

  const { isDarkMode, toggleDarkMode, addBookmark, removeBookmark, isBookmarked, bookmarks, userId } = useUserPreferences();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header */}
          <div className="flex items-center justify-between py-6">
            {/* Left - Back Button */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')} 
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </button>
            </div>

            {/* Center - Logo */}
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                {/* Subtle inner glow */}
                <div className="absolute inset-1 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl"></div>
                {/* Main icon - sleek minimalist design */}
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-white relative z-10">
                  <path d="M10 10 L18 26 L26 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
                  <circle cx="18" cy="14" r="1.5" fill="currentColor" opacity="0.8"/>
                  <line x1="12" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
                  <line x1="14" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                </svg>
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/15 to-transparent rounded-t-3xl"></div>
                <div className="absolute inset-0 rounded-3xl border border-white/10"></div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-light text-gray-900 dark:text-white tracking-wider">VLEEB</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300 font-medium tracking-[0.2em] uppercase mt-1">News Articles</p>
              </div>
            </div>

            {/* Right - Admin Button & Dark Mode Toggle */}
            <div className="flex items-center space-x-4">
              {/* Bookmarks Button */}
              <button
                onClick={() => setShowBookmarks(!showBookmarks)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showBookmarks
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 mr-2 ${showBookmarks ? 'fill-current' : ''}`} />
                My Bookmarks ({bookmarks.length})
              </button>
              
              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 shadow-lg ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 border border-yellow-300'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {/* Toggle Handle */}
                <span
                  className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center ${
                    isDarkMode 
                      ? 'translate-x-7 bg-gray-700 border border-gray-500' 
                      : 'translate-x-1 bg-white border border-yellow-200'
                  }`}
                >
                  {/* Sun Icon for Light Mode */}
                  {!isDarkMode && (
                    <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {/* Moon Icon for Dark Mode */}
                  {isDarkMode && (
                    <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </span>
                
                <span className="sr-only">Toggle dark mode</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Article
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="border-t border-gray-100 dark:border-gray-800 py-4">
            <div className="flex items-center justify-center space-x-8">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>

          {/* Date and Weather */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-3">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
              <span className="font-medium">☀️ 80°</span>
            </div>
          </div>
        </div>
      </header>

      {/* Crypto Ticker */}
      <div className="crypto-ticker">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-3">
            <div className="flex items-center space-x-2 mr-6">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Market Watch</span>
              <span className="text-xs">📈</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-scroll whitespace-nowrap gap-6">
                {displayCryptos.map((crypto, i) => {
                  const { price, change } = displayPrices[i % cryptoPrices.length] || { price: '0.00', change: 1 };
                  return (
                    <div
                      key={crypto.symbol + '-' + i}
                      className="crypto-item"
                      onClick={() => handleCryptoClick(crypto, { price, change })}
                    >
                      <span className="font-bold text-gray-900 dark:text-white">{crypto.symbol}</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">${price}</span>
                      {change > 0 ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 font-medium">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          +{((Math.random() * 5) + 0.5).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400 font-medium">
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                          -{((Math.random() * 5) + 0.5).toFixed(2)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading articles...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-400 font-medium">Error loading articles</p>
              <p className="text-red-500 dark:text-red-300 text-sm mt-2">{error}</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column - News Section */}
          <div className="lg:col-span-7">
            <div className="mb-12">
              <h2 className="text-gray-900 dark:text-white font-bold text-2xl mb-8 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-4">Latest News</h2>
              
              {/* Featured Article */}
              {currentLatestArticle && (
                <div className="mb-12">
                  <h1 
                    className="text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    onClick={() => navigate(`/article/${currentLatestArticle.id}`)}
                  >
                    {currentLatestArticle.title}
                  </h1>
                  
                  {/* Related Headlines */}
                  <div className="space-y-6 mb-10">
                    {currentOlderArticles.slice(0, 2).map((article, index) => (
                      <div 
                        key={article.id} 
                        className="text-xl text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer border-l-4 border-gray-300 dark:border-gray-600 pl-6 py-3 hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-lg"
                        onClick={() => navigate(`/article/${article.id}`)}
                      >
                        "{article.title}"
                      </div>
                    ))}
                  </div>
                  
                  <div 
                    className="inline-flex items-center text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors border-b-2 border-transparent hover:border-gray-900 dark:hover:border-white pb-1"
                    onClick={() => navigate(`/article/${currentLatestArticle.id}`)}
                  >
                    Read The Latest
                    <span className="ml-3 text-2xl">→</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Featured Image */}
          <div className="lg:col-span-3">
            {currentLatestArticle && currentLatestArticle.image_url && (
              <div className="cursor-pointer group" onClick={() => navigate(`/article/${currentLatestArticle.id}`)}>
                <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                  <img 
                    src={currentLatestArticle.image_url} 
                    alt={currentLatestArticle.title}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Trending */}
          <div className="lg:col-span-2">
            <h2 className="text-gray-900 dark:text-white font-bold text-2xl mb-10 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700 pb-4">Trending</h2>
            <div className="space-y-10">
              {trendingArticles.map((article, index) => (
                <div key={article.id} className="cursor-pointer group" onClick={() => navigate(`/article/${article.id}`)}>
                  <div className="flex flex-col space-y-4">
                    {article.image_url && (
                      <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-[0.2em]">
                        {article.category}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-gray-700 dark:hover:text-gray-300 transition-colors line-clamp-3">
                        {article.title}
                      </h3>
                      <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {format(new Date(article.created_at), 'MMM dd')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-20 mb-12">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-center space-x-6">
              <label htmlFor="category-filter" className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wide">Filter by category:</label>
              <select
                id="category-filter"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 font-medium focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-colors text-gray-900 dark:text-white"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                {availableCategories.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {currentOlderArticles.map(article => (
            <div
              key={article.id}
              className="article-card fade-in"
              onClick={() => navigate(`/article/${article.id}`)}
            >
              {article.image_url && (
                <div className="relative overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-[0.15em]">
                    {article.category}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <Clock className="w-3 h-3 mr-1" />
                      {calculateReadingTime(article.content)} min read
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {format(new Date(article.created_at), 'MMM dd')}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 text-lg leading-tight group-hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                  {article.content}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => handleBookmarkToggle(e, article)}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked(article.id)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isBookmarked(article.id) ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked(article.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={e => { e.stopPropagation(); handleEdit(article); }} 
                      className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={e => { e.stopPropagation(); handleDelete(article.id); }} 
                      className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {currentOlderArticles.length === 0 && (
          <div className="text-center py-16 text-gray-600 dark:text-gray-300">
            <p className="text-lg font-medium">No articles found in this category.</p>
          </div>
        )}

        {/* Bookmarks Modal */}
        {showBookmarks && (
          <div className="modal-overlay">
            <div className="modal-content">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Bookmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookmarks</h2>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    ({bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <button
                  onClick={() => setShowBookmarks(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-16 text-gray-600 dark:text-gray-300">
                    <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-lg font-medium mb-2">No bookmarks yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start bookmarking articles to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarks.map(bookmark => {
                      const article = articles.find(a => a.id === bookmark.article_id);
                      if (!article) return null;
                      
                      return (
                        <div
                          key={bookmark.id}
                          className="article-card fade-in"
                          onClick={() => {
                            navigate(`/article/${article.id}`);
                            setShowBookmarks(false); // Close modal when clicking article
                          }}
                        >
                          {article.image_url && (
                            <div className="relative overflow-hidden">
                              <img 
                                src={article.image_url} 
                                alt={article.title}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-[0.15em]">
                                {article.category}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {calculateReadingTime(article.content)} min read
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                  {format(new Date(article.created_at), 'MMM dd')}
                                </div>
                              </div>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 text-lg leading-tight group-hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                              {article.content}
                            </p>
                            <div className="flex items-center justify-between">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookmarkToggle(e, article);
                                }}
                                className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="Remove from bookmarks"
                              >
                                <Bookmark className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crypto Chart Modal */}
      {showCryptoChart && selectedCrypto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCrypto.name}</h2>
                  <p className="text-gray-600">{selectedCrypto.symbol}</p>
                </div>
                <button
                  onClick={() => setShowCryptoChart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Price Display */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">${selectedCrypto.currentPrice}</div>
                    <div className="text-sm text-gray-600">Current Price</div>
                  </div>
                  <div className={`flex items-center text-lg ${selectedCrypto.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedCrypto.change > 0 ? (
                      <ArrowUpRight className="w-5 h-5 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 mr-1" />
                    )}
                    {selectedCrypto.change > 0 ? '+' : ''}{((Math.random() - 0.5) * 20).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Fake Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Chart (24h)</h3>
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={selectedCrypto.change > 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.3"/>
                        <stop offset="100%" stopColor={selectedCrypto.change > 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.1"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Chart area */}
                    <path
                      d={selectedCrypto.chartData.map((point: any, i: number) => {
                        const x = (i / (selectedCrypto.chartData.length - 1)) * 400;
                        const y = 200 - ((point.price / Math.max(...selectedCrypto.chartData.map((p: any) => p.price))) * 180);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke={selectedCrypto.change > 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth="2"
                    />
                    
                    {/* Fill area */}
                    <path
                      d={`${selectedCrypto.chartData.map((point: any, i: number) => {
                        const x = (i / (selectedCrypto.chartData.length - 1)) * 400;
                        const y = 200 - ((point.price / Math.max(...selectedCrypto.chartData.map((p: any) => p.price))) * 180);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')} L 400 200 L 0 200 Z`}
                      fill="url(#chartGradient)"
                    />
                  </svg>
                </div>
              </div>

              {/* Fake Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Market Cap</div>
                  <div className="text-lg font-semibold">${(parseFloat(selectedCrypto.currentPrice) * 1000000).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Volume (24h)</div>
                  <div className="text-lg font-semibold">${(parseFloat(selectedCrypto.currentPrice) * 50000).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Circulating Supply</div>
                  <div className="text-lg font-semibold">1,000,000 {selectedCrypto.symbol}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">All Time High</div>
                  <div className="text-lg font-semibold">${(parseFloat(selectedCrypto.currentPrice) * 1.5).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && user && user.email === ADMIN_EMAIL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Article</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Your name (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="World News">World News</option>
                      <option value="Technology">Technology</option>
                      <option value="Politics">Politics</option>
                      <option value="Business">Business</option>
                      <option value="Sports">Sports</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Health">Health</option>
                      <option value="Science">Science</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.category === 'Other' && (
                      <input
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleInputChange}
                        className="input-field mt-2"
                        placeholder="Enter custom category"
                        required
                      />
                    )}
                  </div>
                </div>
                
                {/* Banner Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {imagePreview && (
                  <div className="my-6 text-center">
                    <div className="text-green-200 font-medium mb-2">Choose a Banner Style</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {/* Removed aspect ratio selection UI */}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Publish Article
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {showArticlePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Preview Article</h2>
                <button
                  onClick={() => setShowArticlePreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {/* Image Preview */}
              {formData.imageUrl && (
                <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', borderRadius: 8, overflow: 'hidden', border: '1px solid #333', background: '#222' }} className="mb-4">
                  <img
                    src={formData.imageUrl}
                    alt="Article preview"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block', maxHeight: 400 }}
                  />
                </div>
              )}
              <h2 className="text-3xl font-extrabold text-green-900 mb-2 tracking-wide">{formData.title}</h2>
              <div className="flex items-center gap-4 mb-4 text-sm text-green-800">
                <span>{formData.author && <>By {formData.author}</>}</span>
                <span className="bg-green-900/10 text-green-800 px-2 py-1 rounded-full text-xs font-mono ml-auto">
                  {formData.category === 'Other' ? formData.customCategory : formData.category}
                </span>
              </div>
              <div className="prose max-w-none text-green-900 text-lg leading-relaxed mt-4">
                {formData.content}
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowArticlePreview(false)}
                  className="btn-secondary flex-1"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleFinalPublish}
                  className="btn-primary flex-1"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Article</h2>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    value={editForm.content}
                    onChange={handleEditInputChange}
                    rows={6}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={editForm.author}
                      onChange={handleEditInputChange}
                      className="input-field"
                      placeholder="Your name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editForm.category}
                      onChange={handleEditInputChange}
                      className="input-field"
                      placeholder="Category"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={editForm.imageUrl}
                    onChange={handleEditInputChange}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditSave}
                  className="btn-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 focus-ring"
          title="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 36 36" fill="none" className="text-white">
                    <path d="M10 10 L18 26 L26 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="18" cy="14" r="1.5" fill="currentColor"/>
                    <line x1="12" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">VLEEB</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Professional News Platform</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                Stay informed with the latest news, trends, and insights from around the world. 
                Your trusted source for professional journalism and breaking stories.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h4>
              <ul className="space-y-2">
                {categoryOptions.slice(1).map(category => (
                  <li key={category}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">About Us</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © 2024 VLEEB News. All rights reserved. | Built with modern web technologies
            </p>
          </div>
        </div>
      </footer>

      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  )
}

interface ArticleCardProps {
  article: any
  onDelete: () => void
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onDelete }) => {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {article.category}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {format(new Date(article.date), 'MMM dd, yyyy')}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {article.title}
          </h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <User className="w-4 h-4" />
            {article.author}
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            {article.content.length > 200 
              ? `${article.content.substring(0, 200)}...` 
              : article.content
            }
          </p>
        </div>
        
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
          title="Delete article"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default NewsPage 