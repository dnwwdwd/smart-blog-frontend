import { useState, useEffect, useCallback } from 'react';
import { AxiosResponse } from 'axios';

interface UseInfiniteScrollOptions<T, R> {
  fetchData: (params: R) => Promise<AxiosResponse<API.BaseResponsePageArticleVo | API.BaseResponsePageColumnVo | API.BaseResponsePageTagVo, any>>;
  initialParams: R;
  pageSize?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  total: number;
}

export function useInfiniteScroll<T, R extends { current?: number; pageSize?: number }>(
  options: UseInfiniteScrollOptions<T, R>
): UseInfiniteScrollReturn<T> {
  const { fetchData, initialParams, pageSize = 10 } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(async (page: number, isRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = {
        ...initialParams,
        current: page,
        pageSize,
      } as R;
      
      const response = await fetchData(params);
      const result = response.data?.data;
      
      if (result) {
        const newData = (result.records || []) as T[];
        const totalCount = result.total || 0;
        const totalPages = result.pages || 0;
        
        setTotal(totalCount);
        
        if (isRefresh) {
          setData(newData);
          setCurrentPage(1);
        } else {
          setData(prev => page === 1 ? newData : [...prev, ...newData]);
          setCurrentPage(page);
        }
        
        setHasMore(page < totalPages);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, initialParams, pageSize, loading]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(currentPage + 1);
    }
  }, [loadData, currentPage, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    setCurrentPage(1);
    setHasMore(true);
    loadData(1, true);
  }, [loadData]);

  useEffect(() => {
    loadData(1, true);
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMore,
    refresh,
    total,
  };
}