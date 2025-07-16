import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

export interface Bookmark {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
  article_title: string;
  article_category: string;
}

export interface ReadingProgress {
  article_id: string;
  user_id: string;
  progress: number; // 0-100
  last_read: string;
}

interface UserPreferencesContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (articleId: string, articleTitle: string, articleCategory: string) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
  
  // Reading Progress
  readingProgress: ReadingProgress[];
  updateReadingProgress: (articleId: string, progress: number) => Promise<void>;
  getReadingProgress: (articleId: string) => number;
  
  // User ID (for now using a simple identifier, in production this would come from auth)
  userId: string;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  // Generate a stable user ID (in production, this would come from authentication)
  const [userId] = useState(() => {
    const stored = localStorage.getItem('vleeb_user_id');
    if (stored) return stored;
    const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('vleeb_user_id', newId);
    return newId;
  });

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('vleeb_dark_mode');
    return stored ? JSON.parse(stored) : false;
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // Reading progress state
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('vleeb_dark_mode', JSON.stringify(isDarkMode));
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadUserData = async () => {
    try {
      // Load bookmarks from localStorage first (fallback)
      const localBookmarks = localStorage.getItem(`vleeb_bookmarks_${userId}`);
      if (localBookmarks) {
        const parsedBookmarks = JSON.parse(localBookmarks);
        setBookmarks(parsedBookmarks);
      }

      // Try to load from Supabase
      const { data: bookmarkData, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.warn('Could not load bookmarks from database, using localStorage:', error.message);
        return; // Use localStorage data instead
      }
      
      if (bookmarkData && bookmarkData.length > 0) {
        setBookmarks(bookmarkData);
        // Update localStorage with database data
        localStorage.setItem(`vleeb_bookmarks_${userId}`, JSON.stringify(bookmarkData));
      }

      // Load reading progress from localStorage first
      const localProgress = localStorage.getItem(`vleeb_reading_progress_${userId}`);
      if (localProgress) {
        setReadingProgress(JSON.parse(localProgress));
      }

      // Try to load reading progress from Supabase
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (progressError) {
        console.warn('Could not load reading progress from database, using localStorage:', progressError.message);
        return;
      }
      
      if (progressData) {
        setReadingProgress(progressData);
        localStorage.setItem(`vleeb_reading_progress_${userId}`, JSON.stringify(progressData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage only
      const localBookmarks = localStorage.getItem(`vleeb_bookmarks_${userId}`);
      if (localBookmarks) {
        setBookmarks(JSON.parse(localBookmarks));
      }
      
      const localProgress = localStorage.getItem(`vleeb_reading_progress_${userId}`);
      if (localProgress) {
        setReadingProgress(JSON.parse(localProgress));
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const addBookmark = async (articleId: string, articleTitle: string, articleCategory: string) => {
    try {
      const newBookmark = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        article_id: articleId,
        user_id: userId,
        article_title: articleTitle,
        article_category: articleCategory,
        created_at: new Date().toISOString(),
      };

      // Update local state immediately for better UX
      setBookmarks((prev) => {
        const updated = [...prev, newBookmark];
        localStorage.setItem(`vleeb_bookmarks_${userId}`, JSON.stringify(updated));
        return updated;
      });

      // Try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert([{
            article_id: articleId,
            user_id: userId,
            article_title: articleTitle,
            article_category: articleCategory,
          }])
          .select()
          .single();

        if (error) {
          console.warn('Could not save bookmark to database, using localStorage only:', error.message);
        } else if (data) {
          // Update with the real database ID
          setBookmarks((prev) => {
            const updated = prev.map((b) => 
              b.article_id === articleId && b.id.startsWith('local_') ? data : b
            );
            localStorage.setItem(`vleeb_bookmarks_${userId}`, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (dbError) {
        console.warn('Database error, bookmark saved to localStorage only:', dbError);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  const removeBookmark = async (articleId: string) => {
    try {
      // Update local state immediately for better UX
      setBookmarks((prev) => {
        const updated = prev.filter((b) => b.article_id !== articleId);
        localStorage.setItem(`vleeb_bookmarks_${userId}`, JSON.stringify(updated));
        return updated;
      });

      // Try to remove from Supabase
      try {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', userId);

        if (error) {
          console.warn('Could not remove bookmark from database, removed from localStorage only:', error.message);
        }
      } catch (dbError) {
        console.warn('Database error, bookmark removed from localStorage only:', dbError);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  const isBookmarked = (articleId: string) => {
    return bookmarks.some(b => b.article_id === articleId);
  };

  const updateReadingProgress = async (articleId: string, progress: number) => {
    try {
      const clampedProgress = Math.min(100, Math.max(0, progress));
      
      // Update local state immediately
      setReadingProgress((prev) => {
        const existing = prev.find(p => p.article_id === articleId);
        let updated;
        
        if (existing) {
          updated = prev.map(p => 
            p.article_id === articleId 
              ? { ...p, progress: clampedProgress, last_read: new Date().toISOString() }
              : p
          );
        } else {
          updated = [...prev, {
            article_id: articleId,
            user_id: userId,
            progress: clampedProgress,
            last_read: new Date().toISOString(),
          }];
        }
        
        localStorage.setItem(`vleeb_reading_progress_${userId}`, JSON.stringify(updated));
        return updated;
      });

      // Try to save to Supabase
      try {
        const { error } = await supabase
          .from('reading_progress')
          .upsert({
            article_id: articleId,
            user_id: userId,
            progress: clampedProgress,
            last_read: new Date().toISOString(),
          });

        if (error) {
          console.warn('Could not save reading progress to database, using localStorage only:', error.message);
        }
      } catch (dbError) {
        console.warn('Database error, reading progress saved to localStorage only:', dbError);
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const getReadingProgress = (articleId: string) => {
    const progress = readingProgress.find(p => p.article_id === articleId);
    return progress ? progress.progress : 0;
  };

  return (
    <UserPreferencesContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      readingProgress,
      updateReadingProgress,
      getReadingProgress,
      userId,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}; 