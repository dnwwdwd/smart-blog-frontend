'use client';

import React, { useState, createContext, useContext } from 'react';
import { getArticlePage } from '@/api/articleController';
import ArticleListClient from '@/components/ArticleListClient';
import InfiniteScrollContainer from '@/components/InfiniteScrollContainer';
import Sidebar from '@/components/Sidebar/page';

// 创建 Context 来传递数据
interface ArticlesContextType {
  data: API.ArticleVo[];
  loading: boolean;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const useArticlesData = () => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticlesData must be used within ArticlesPageClient');
  }
  return context;
};

interface ArticlesPageClientProps {
  initialData: API.ArticleVo[];
  initialTotal: number;
}

export default function ArticlesPageClient({ initialData, initialTotal }: ArticlesPageClientProps) {
  const [data, setData] = useState<API.ArticleVo[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialData.length < initialTotal);

  const PAGE_SIZE = 20;

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const params = {
        current: nextPage,
        pageSize: PAGE_SIZE,
      };

      const response = (await getArticlePage(params)) as any; // BaseResponse<Page<ArticleVo>>

      if (response?.code === 0 && response?.data) {
        const pageData = response.data;
        const newData = (pageData.records || []) as API.ArticleVo[];
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        const totalCount = pageData.total || 0;
        setTotal(totalCount);
        const reachedEnd = newData.length < PAGE_SIZE || (data.length + newData.length) >= totalCount;
        setHasMore(!reachedEnd);
      }
    } catch (error) {
      console.error('Failed to load more articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArticlesContext.Provider value={{ data, loading }}>
      <div className="page-layout">
        <div className="main-content">
          <InfiniteScrollContainer
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          >
            <ArticleListClient />
          </InfiniteScrollContainer>
        </div>
        <div className="sidebar-content">
          <Sidebar />
        </div>
      </div>
    </ArticlesContext.Provider>
  );
}