'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin, Empty } from 'antd';
import { getColumnPage } from '@/api/columnController';
import { getArticlePage, getArticlePageByColumnId } from '@/api/articleController';
import ArticleCard from '@/components/ArticleCard';
import './styles.css';

interface HomeColumnBarProps {
  initialColumns: API.ColumnVo[];
  initialTotal: number;
  initialArticles?: API.ArticleVo[];
  initialActiveColumnId?: number | string; // 'all' | number
}

export default function HomeColumnBar({
  initialColumns,
  initialTotal,
  initialArticles = [],
  initialActiveColumnId = 'all',
}: HomeColumnBarProps) {
  // 将“全部文章”插入到专栏列表最前面作为第一个 Tab
  const composedColumns: (API.ColumnVo & { __all__?: boolean })[] = [
    { id: -1, name: '全部文章', __all__: true },
    ...initialColumns,
  ];

  // Tabs state (columns)
  const [columns, setColumns] = useState<(API.ColumnVo & { __all__?: boolean })[]>(composedColumns);
  const [totalColumns, setTotalColumns] = useState<number>(initialTotal + 1); // +1: 全部文章
  const [colPage, setColPage] = useState<number>(1);
  const COL_PAGE_SIZE = 12; // 每页展示的专栏数量，左右按钮分页（不含“全部文章”）
  // Active tab
  const [activeColKey, setActiveColKey] = useState<number | 'all'>(
    initialActiveColumnId === 'all' ? 'all' : Number(initialActiveColumnId)
  );

  // Articles state for selected tab
  const [articles, setArticles] = useState<API.ArticleVo[]>(initialArticles);
  const [articlePage, setArticlePage] = useState<number>(1);
  const ARTICLE_PAGE_SIZE = 12;
  const [hasMoreArticles, setHasMoreArticles] = useState<boolean>(true);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const initialFetchRef = useRef(false);

  // Loading flags
  const [loadingCols, setLoadingCols] = useState(false);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const canPrevCols = useMemo(() => colPage > 1, [colPage]);
  const canNextCols = useMemo(
    () => colPage * COL_PAGE_SIZE < totalColumns - 1, // 扣除“全部文章”
    [colPage, totalColumns]
  );

  // Fetch columns by page (不包含“全部文章”，但更新时继续把它放到最前)
  const fetchColumns = async (page: number) => {
    if (loadingCols) return;
    setLoadingCols(true);
    try {
      const res = (await getColumnPage({ current: page, pageSize: COL_PAGE_SIZE })) as any;
      const list: API.ColumnVo[] = res?.data?.records || [];
      const total: number = res?.data?.total || 0;
      setColumns([{ id: -1, name: '全部文章', __all__: true }, ...list]);
      setTotalColumns(total + 1);
      setColPage(page);
      // 如果当前选中的专栏不在新页中且不是 all，默认选中新页第一项
      const exists = activeColKey === 'all' || list.some((c) => c.id === activeColKey);
      const nextActive = exists ? activeColKey : (list?.[0]?.id ?? 'all');
      handleSelectTab(nextActive, false);
    } catch (e) {
      console.error('加载专栏失败', e);
    } finally {
      setLoadingCols(false);
    }
  };

  const handlePrevCols = () => {
    if (!canPrevCols) return;
    fetchColumns(colPage - 1);
  };

  const handleNextCols = () => {
    if (!canNextCols) return;
    fetchColumns(colPage + 1);
  };

  // Fetch articles for tabs
  const fetchArticlesAll = useCallback(async (page = 1, append = false) => {
    if (loadingArticles) return;
    setLoadingArticles(true);
    try {
      const res = (await getArticlePage({ current: page, pageSize: ARTICLE_PAGE_SIZE })) as any;
      const list: API.ArticleVo[] = res?.data?.records || [];
      const total: number = res?.data?.total || 0;
      setArticles((prev) => (append ? [...prev, ...list] : list));
      setArticlePage(page);
      setHasMoreArticles(page * ARTICLE_PAGE_SIZE < total);
    } catch (e) {
      console.error('加载全部文章失败', e);
    } finally {
      setLoadingArticles(false);
    }
  }, [ARTICLE_PAGE_SIZE, loadingArticles]);

  const fetchArticlesByColumn = useCallback(async (columnId: number, page = 1, append = false) => {
    if (loadingArticles) return;
    setLoadingArticles(true);
    try {
      const res = (await getArticlePageByColumnId(
        { columnId },
        { current: page, pageSize: ARTICLE_PAGE_SIZE }
      )) as any;
      const list: API.ArticleVo[] = res?.data?.records || [];
      const total: number = res?.data?.total || 0;
      setArticles((prev) => (append ? [...prev, ...list] : list));
      setArticlePage(page);
      setHasMoreArticles(page * ARTICLE_PAGE_SIZE < total);
    } catch (e) {
      console.error('加载专栏文章失败', e);
    } finally {
      setLoadingArticles(false);
    }
  }, [ARTICLE_PAGE_SIZE, loadingArticles]);

  const handleSelectTab = useCallback(
    (key: number | 'all', keepPage = false) => {
    setActiveColKey(key);
    const nextPage = keepPage ? articlePage : 1;
    if (key === 'all') {
      fetchArticlesAll(nextPage, keepPage && nextPage > 1);
    } else {
      fetchArticlesByColumn(Number(key), nextPage, keepPage && nextPage > 1);
    }
    },
    [articlePage, fetchArticlesAll, fetchArticlesByColumn]
  );

  const loadMoreArticles = useCallback(() => {
    if (loadingArticles || !hasMoreArticles) return;
    if (activeColKey === 'all') {
      fetchArticlesAll(articlePage + 1, true);
    } else if (typeof activeColKey === 'number') {
      fetchArticlesByColumn(activeColKey, articlePage + 1, true);
    }
  }, [activeColKey, articlePage, fetchArticlesAll, fetchArticlesByColumn, hasMoreArticles, loadingArticles]);

  // 初次挂载：若首屏没有文章则根据默认 tab 拉取
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;
    if (!initialArticles || initialArticles.length === 0) {
      handleSelectTab(activeColKey, false);
    }
  }, [activeColKey, handleSelectTab, initialArticles]);

  // 滑动触底自动加载
  useEffect(() => {
    const target = loadMoreTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMoreArticles && !loadingArticles) {
          loadMoreArticles();
        }
      },
      { rootMargin: '200px 0px 200px', threshold: 0 }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [hasMoreArticles, loadingArticles, loadMoreArticles]);

  return (
    <section className="home-pillbar-section">
      <div className="home-pillbar" role="tablist" aria-label="专栏切换">
        <button
          className={`scroll-btn${canPrevCols ? '' : ' disabled'}`}
          aria-label="上一页专栏"
          onClick={handlePrevCols}
          disabled={!canPrevCols}
        >
          <LeftOutlined />
        </button>
        <div className="pillbar-list">
          {columns.map((col) => {
            const key: number | 'all' = (col as any).__all__ ? 'all' : (col.id as number);
            const selected = activeColKey === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={selected}
                className={`pill${selected ? ' is-selected' : ''}`}
                onClick={() => handleSelectTab(key)}
                title={col.name || ''}
              >
                {col.name}
              </button>
            );
          })}
        </div>
        <button
          className={`scroll-btn${canNextCols ? '' : ' disabled'}`}
          aria-label="下一页专栏"
          onClick={handleNextCols}
          disabled={!canNextCols}
        >
          <RightOutlined />
        </button>
        <Link href="/columns" prefetch={false} className="pill-more" aria-label="更多专栏">
          » 更多
        </Link>
      </div>

      {/* 文章瀑布流 */}
      {articles.length === 0 && !loadingArticles ? (
        <div className="masonry-empty">
          <Empty description="暂无文章" />
        </div>
      ) : (
        <div className="masonry">
          {articles.map((article) => (
            <div key={article.id} className="masonry-node">
              <ArticleCard article={article} showViews />
            </div>
          ))}
        </div>
      )}
      <div className="articles-loader" aria-live="polite">
        {loadingArticles && (
          <div className="loading-line">
            <Spin size="small" /> 加载中...
          </div>
        )}
        {!hasMoreArticles && articles.length > 0 && !loadingArticles && (
          <div className="loader-end">已经到底啦</div>
        )}
        <div ref={loadMoreTriggerRef} className="articles-sentinel" aria-hidden />
      </div>

      {/* 遮罩式加载（切换专栏/分页专栏时） */}
      {loadingCols && (
        <div className="pillbar-loading" aria-hidden>
          <Spin />
        </div>
      )}
    </section>
  );
}
