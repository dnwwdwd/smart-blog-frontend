'use client';

import React, { useState, createContext, useContext } from 'react';
import { getTagPage } from '@/api/tagController';
import TagListClient from '@/components/TagListClient';
import InfiniteScrollContainer from '@/components/InfiniteScrollContainer';

// 创建 Context 来传递数据
interface TagsContextType {
  data: API.TagVo[];
  loading: boolean;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const useTagsData = () => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTagsData must be used within TagsPageClient');
  }
  return context;
};

interface TagsPageClientProps {
  initialData: API.TagVo[];
  initialTotal: number;
}

export default function TagsPageClient({ initialData, initialTotal }: TagsPageClientProps) {
  const [data, setData] = useState<API.TagVo[]>(initialData);
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

      const response = (await getTagPage(params)) as any; // BaseResponse<Page<TagVo>>
      if (response?.code === 0 && response?.data) {
        const pageData = response.data;
        const newData = (pageData.records || []) as API.TagVo[];
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        const totalCount = pageData.total || 0;
        setTotal(totalCount);
        setHasMore(newData.length === PAGE_SIZE && (data.length + newData.length) < totalCount);
      }
    } catch (error) {
      console.error('Failed to load more tags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TagsContext.Provider value={{ data, loading }}>
      <div className="tags-main-content">
        <InfiniteScrollContainer
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        >
          <TagListClient />
        </InfiniteScrollContainer>
      </div>
    </TagsContext.Provider>
  );
}