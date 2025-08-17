'use client';

import React, { useState, useCallback, ReactNode, createContext, useContext } from 'react';
import { AxiosResponse } from 'axios';
import InfiniteScrollContainer from '@/components/InfiniteScrollContainer';

// 创建 Context 来传递数据
interface InfiniteScrollContextType<T> {
  data: T[];
  loading: boolean;
}

const InfiniteScrollContext = createContext<InfiniteScrollContextType<any> | null>(null);

// Hook 来使用 context
export function useInfiniteScrollData<T>(): InfiniteScrollContextType<T> {
  const context = useContext(InfiniteScrollContext);
  if (!context) {
    throw new Error('useInfiniteScrollData must be used within InfiniteScrollWrapper');
  }
  return context;
}

interface InfiniteScrollWrapperProps<T, P> {
  initialData: T[];
  initialTotal: number;
  fetchData: (params: P) => Promise<AxiosResponse<API.BaseResponsePageArticleVo | API.BaseResponsePageColumnVo | API.BaseResponsePageTagVo>>;
  initialParams: P;
  pageSize?: number;
  children: ReactNode;
}

export default function InfiniteScrollWrapper<T, P extends { current?: number; pageSize?: number }>(
  { initialData, initialTotal, fetchData, initialParams, pageSize = 20, children }: InfiniteScrollWrapperProps<T, P>
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialData.length < initialTotal);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const params = {
        ...initialParams,
        current: nextPage,
        pageSize,
      } as P;

      const response = await fetchData(params);
      const result = response.data?.data;
      
      if (result?.records) {
        const newData = result.records as T[];
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        setTotal(result.total || 0);
        setHasMore(newData.length === pageSize && (data.length + newData.length) < (result.total || 0));
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, initialParams, pageSize, fetchData, data.length]);

  return (
    <InfiniteScrollContext.Provider value={{ data, loading }}>
      <InfiniteScrollContainer
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      >
        {children}
      </InfiniteScrollContainer>
    </InfiniteScrollContext.Provider>
  );
}