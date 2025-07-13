import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface Article {
  id: string;
  title: string;
  content: string;
  author?: string;
  category: string;
  image_url?: string;
  created_at: string;
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line
  }, []);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setArticles(data || []);
    setLoading(false);
  }

  async function createArticle(article: Omit<Article, 'id' | 'created_at'>) {
    const { error } = await supabase.from('articles').insert([article]);
    if (error) throw error;
    await fetchArticles();
  }

  async function updateArticle(id: string, updatedFields: Partial<Article>) {
    const { error } = await supabase.from('articles').update(updatedFields).eq('id', id);
    if (error) throw error;
    await fetchArticles();
  }

  async function deleteArticle(id: string) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) throw error;
    await fetchArticles();
  }

  return { articles, loading, error, fetchArticles, createArticle, updateArticle, deleteArticle };
} 