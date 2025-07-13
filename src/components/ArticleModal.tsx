import { NewsArticle } from '../context/NewsContext';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface ArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
}

export default function ArticleModal({ article, onClose }: ArticleModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-green-400/30">
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        {article.imageUrl && (
          <div className="w-full h-64 bg-black flex items-center justify-center overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover object-center"
              style={{ maxHeight: 256 }}
            />
          </div>
        )}
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-green-200 mb-2 tracking-wide drop-shadow-glow">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 mb-4 text-sm text-green-300">
            <span>{article.author && <>By {article.author}</>}</span>
            <span className="opacity-60">{format(new Date(article.date), 'MMM dd, yyyy')}</span>
            <span className="bg-green-900/40 text-green-300 px-2 py-1 rounded-full text-xs font-mono ml-auto">
              {article.category}
            </span>
          </div>
          <div className="prose prose-invert max-w-none text-green-100 text-lg leading-relaxed mt-4">
            {article.content}
          </div>
        </div>
      </div>
      <style>{`
        .drop-shadow-glow {
          text-shadow: 0 0 8px #00ffae, 0 0 2px #00ffae;
        }
      `}</style>
    </div>
  );
} 