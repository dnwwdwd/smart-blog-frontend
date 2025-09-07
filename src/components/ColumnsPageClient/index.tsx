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

  const PAGE_SIZE = 20;

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const response = (await getColumnPage({
        current: nextPage,
        pageSize: PAGE_SIZE,
      })) as any;

      if (response?.code === 0 && response?.data) {
        const newData = response.data.records || [];
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        const totalCount = response.data.total || 0;
        setTotal(totalCount);
        // 如果新数据长度小于 PAGE_SIZE，说明到了最后一页；或者累积数据量已达到总数
        const reachedEnd = newData.length < PAGE_SIZE || (data.length + newData.length) >= totalCount;
        setHasMore(!reachedEnd);
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