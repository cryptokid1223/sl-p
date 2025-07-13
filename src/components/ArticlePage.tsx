import { useParams, useNavigate } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import { useEffect, useState } from 'react';

export default function ArticlePage() {
  const { id } = useParams();
  const { articles, loading } = useArticles();
  const navigate = useNavigate();
  const article = articles.find(a => a.id === id);

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

  function wordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

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

  if (loading) return <div className="text-center text-green-200 mt-10">Loading...</div>;
  if (!article) return <div className="text-center text-red-500 mt-10">Article not found.</div>;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto p-8">
        <button
          onClick={() => navigate('/news')}
          className="mb-6 px-4 py-2 bg-gray-900 text-green-200 rounded hover:bg-gray-800"
        >
          ← Back to News
        </button>
        <div className="bg-gray-900 rounded-2xl shadow-lg border border-green-400/20 w-full overflow-hidden flex flex-col items-center">
          {article.image_url && (
            <img src={article.image_url} alt={article.title} className="w-full mb-6 rounded-t-2xl object-contain max-h-[400px] bg-black" />
          )}
          <div className="w-full px-8 py-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2 text-green-200 drop-shadow-glow text-center">{article.title}</h1>
            <div className="text-green-300 text-xs mb-4 text-center">
              {new Date(article.created_at).toLocaleString()}
            </div>
            <div className="prose prose-invert text-green-100 text-lg leading-relaxed mb-6 text-center">
              {article.content}
            </div>
            <div className="flex items-center gap-2 text-sm text-green-400 w-full justify-center">
              {article.author && <>By {article.author}</>}
              <span className="bg-green-900/40 text-green-300 px-2 py-1 rounded-full text-xs font-mono ml-auto">
                {article.category}
              </span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-green-200 mb-4">Comments</h3>
          {commentsLoading ? (
            <div className="text-green-300">Loading comments...</div>
          ) : commentsError ? (
            <div className="text-red-500">{commentsError}</div>
          ) : comments.length === 0 ? (
            <div className="text-green-300">No comments yet. Be the first to comment!</div>
          ) : (
            <ul className="space-y-4 mb-8">
              {comments.map(comment => (
                <li key={comment.id} className="bg-gray-800 rounded-lg p-4 border border-green-900/40">
                  <div className="text-green-100 text-sm mb-1">{comment.content}</div>
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <span>By {comment.author || 'Anonymous'}</span>
                    <span className="ml-auto text-green-700">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleCommentSubmit} className="bg-gray-900 rounded-lg p-6 border border-green-400/20 flex flex-col gap-3">
            <textarea
              name="content"
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              className="input-field resize-none"
              rows={3}
              maxLength={400}
              placeholder="Write your comment (max 50 words)..."
              required
            />
            <input
              type="text"
              name="author"
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              className="input-field"
              placeholder="Your name (optional)"
              maxLength={32}
            />
            <div className="flex items-center justify-between text-xs text-green-300">
              <span>{wordCount(commentContent)} / 50 words</span>
              {commentError && <span className="text-red-500">{commentError}</span>}
            </div>
            <button
              type="submit"
              className="btn-primary mt-2"
              disabled={submitting || wordCount(commentContent) > 50}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 