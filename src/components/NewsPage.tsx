import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useArticles } from '../hooks/useArticles';
import { Plus, ArrowLeft, Trash2, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import CryptoTicker from './CryptoTicker'
import { useAuth } from '../hooks/useAuth'
import ArticleModal from './ArticleModal'
import React, { useRef, useEffect, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import { supabase } from '../supabaseClient';

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

  // Add refs for preview image and canvas
  const previewImgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Remove all drag-and-drop and file upload logic
  // Only allow users to enter an image URL
  // Remove imageFile, imagePreview, onDrop, handlePaste, and file upload UI
  // Only keep the image URL input and use it for all image display

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

  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const [latestArticle, ...olderArticles] = sortedArticles;

  // Filter older articles by category
  const filteredOlderArticles = selectedCategory === 'All'
    ? olderArticles
    : olderArticles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-16">
            <div className="absolute left-0 flex items-center gap-4 h-full">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary inline-flex items-center gap-2 bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-white">Vleeb</h1>
            </div>
            <div className="absolute right-0 flex items-center h-full">
              {isAdmin && (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="btn-primary inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Article
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <CryptoTicker />

      {/* Section Header */}
      <div className="max-w-2xl mx-auto text-center mt-10 mb-6">
        <h2 className="text-3xl font-bold text-green-200 drop-shadow-glow">Latest News Article</h2>
      </div>

      {/* Featured Article */}
      {latestArticle && (
        <div className="max-w-2xl mx-auto mb-10 cursor-pointer" onClick={() => navigate(`/article/${latestArticle.id}`)}>
          <div className="bg-gray-900 rounded-2xl shadow-lg border border-green-400/20 w-full overflow-hidden flex flex-col items-center">
            {latestArticle.image_url && (
              <img src={latestArticle.image_url} alt={latestArticle.title} className="w-full mb-6 rounded-t-2xl object-contain max-h-[400px] bg-black" />
            )}
            <div className="w-full px-8 py-6 flex flex-col items-center">
              <h2 className="text-2xl font-extrabold text-green-200 mb-2 tracking-wide text-center drop-shadow-glow">
                {latestArticle.title}
              </h2>
              <div className="text-green-300 text-xs mb-4 text-center">
                {format(new Date(latestArticle.created_at), 'MMM dd, yyyy, HH:mm')}
              </div>
              <div className="prose prose-invert text-green-100 text-lg leading-relaxed mb-6 text-center line-clamp-4">
                {latestArticle.content}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2 mt-2">
                <span className="text-green-400 text-sm font-mono">{latestArticle.author && <>By {latestArticle.author}</>}</span>
                <span className="bg-green-900/40 text-green-300 px-2 py-1 rounded-full text-xs font-mono">
                  {latestArticle.category}
                </span>
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4">
                  <button onClick={e => { e.stopPropagation(); handleEdit(latestArticle); }} className="btn-secondary">Edit</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(latestArticle.id); }} className="btn-danger bg-red-600 text-white hover:bg-red-700 border border-red-700">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center gap-4">
        <label htmlFor="category-filter" className="text-green-200 font-medium">Sort by category:</label>
        <select
          id="category-filter"
          className="input-field py-1 px-2 text-sm bg-gray-900 text-green-200 border-green-400"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          {categoryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Older Articles as Boxes (Horizontal Scroll) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-6 pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filteredOlderArticles.length === 0 ? (
            <div className="text-green-300 text-center py-8 w-full">No articles found in this category.</div>
          ) : (
            filteredOlderArticles.map(article => (
              <div
                key={article.id}
                className="min-w-[320px] max-w-xs bg-gray-900 rounded-xl shadow-md border border-green-400/20 flex-shrink-0 cursor-pointer hover:border-green-400/60 transition-all duration-200 flex flex-col items-center"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                {article.image_url && (
                  <img src={article.image_url} alt={article.title} className="w-full h-40 object-cover rounded-t-xl bg-black" />
                )}
                <div className="w-full px-4 py-4 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-green-200 mb-1 text-center truncate w-full">
                    {article.title}
                  </h3>
                  <div className="text-green-300 text-xs mb-2 text-center">
                    {format(new Date(article.created_at), 'MMM dd, yyyy, HH:mm')}
                  </div>
                  <div className="prose prose-invert text-green-100 text-sm leading-snug mb-2 text-center line-clamp-2">
                    {article.content}
                  </div>
                  <span className="bg-green-900/40 text-green-300 px-2 py-1 rounded-full text-xs font-mono mt-auto">
                    {article.category}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={e => { e.stopPropagation(); handleEdit(article); }} className="btn-secondary">Edit</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(article.id); }} className="btn-danger bg-red-600 text-white hover:bg-red-700 border border-red-700">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
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
      {/* Articles List */}
      {/* Remove any old vertical list/grid of large article cards at the bottom (do not render them) */}
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
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {article.imageUrl && (
        <div className="mt-4">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default NewsPage 