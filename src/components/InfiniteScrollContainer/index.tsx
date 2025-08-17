import React, { useEffect, useRef, useCallback } from 'react';
import { Spin } from 'antd';
import styles from './index.module.css';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  children,
  loading,
  hasMore,
  onLoadMore,
  threshold = 200,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loadingRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    if (isNearBottom) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, onLoadMore, threshold]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${className}`}
    >
      {children}
      {loading && (
        <div className={styles.loading}>
          <Spin size="large" />
        </div>
      )}
      {!hasMore && (
        <div className={styles.noMore}>
          没有更多数据了
        </div>
      )}
    </div>
  );
};

export default InfiniteScrollContainer;