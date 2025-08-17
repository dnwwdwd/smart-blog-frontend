'use client';

import React, { useState, createContext, useContext } from 'react';
import { getColumnPage } from '@/api/columnController';
import ColumnListClient from '@/components/ColumnListClient';
import InfiniteScrollContainer from '@/components/InfiniteScrollContainer';

// 创建 Context 来传递数据
interface ColumnsContextType {
  data: API.ColumnVo[];
  loading: boolean;
}

const ColumnsContext = createContext<ColumnsContextType | null>(null);

// Hook 来使用 context
export function useColumnsData(): ColumnsContextType {
  const context = useContext(ColumnsContext);
  if (!context) {
    throw new Error('useColumnsData must be used within ColumnsPageClient');
  }
  return context;
}

interface ColumnsPageClientProps {
  initialData: API.ColumnVo[];
  initialTotal: number;
}

export default function ColumnsPageClient({ initialData, initialTotal }: ColumnsPageClientProps) {
  const [data, setData] = useState<API.ColumnVo[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialData.length < initialTotal);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = (await getColumnPage({
        current: nextPage,
        pageSize: 20,
      })) as any;

      if (response?.code === 0 && response?.data) {
        const newData = response.data.records || [];
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        setTotal(response.data.total || 0);
        setHasMore(newData.length === 20 && data.length + newData.length < response.data.total);
      }
    } catch (error) {
      console.error('加载更多专栏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ColumnsContext.Provider value={{ data, loading }}>
      <InfiniteScrollContainer
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      >
        <ColumnListClient />
      </InfiniteScrollContainer>
    </ColumnsContext.Provider>
  );
}