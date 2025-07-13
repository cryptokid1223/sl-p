import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface NewsArticle {
  id: string
  title: string
  content: string
  author: string
  date: string
  category: string
  imageUrl?: string
}

interface NewsContextType {
  articles: NewsArticle[]
  addArticle: (article: Omit<NewsArticle, 'id' | 'date'>) => void
  deleteArticle: (id: string) => void
}

const NewsContext = createContext<NewsContextType | undefined>(undefined)

export const useNews = () => {
  const context = useContext(NewsContext)
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider')
  }
  return context
}

interface NewsProviderProps {
  children: ReactNode
}

export const NewsProvider: React.FC<NewsProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([])

  const addArticle = (articleData: Omit<NewsArticle, 'id' | 'date'>) => {
    const newArticle: NewsArticle = {
      ...articleData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    }
    setArticles(prev => [newArticle, ...prev])
  }

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id))
  }

  return (
    <NewsContext.Provider value={{ articles, addArticle, deleteArticle }}>
      {children}
    </NewsContext.Provider>
  )
} 