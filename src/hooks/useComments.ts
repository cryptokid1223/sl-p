import { useState } from 'react';
import { supabase } from '../supabaseClient';

export interface Comment {
  id: string;
  article_id: string;
  content: string;
  author?: string;
  created_at: string;
}

export function useComments(articleId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchComments() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    setComments(data || []);
    setLoading(false);
  }

  async function addComment({ content, author }: { content: string; author?: string }) {
    const { error } = await supabase.from('comments').insert([
      { article_id: articleId, content, author }
    ]);
    if (error) throw error;
    await fetchComments();
  }

  return { comments, loading, error, fetchComments, addComment };
} 