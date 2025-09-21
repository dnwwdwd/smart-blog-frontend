'use client';

import React, { useEffect, useState } from 'react';
import { Card, Pagination, Spin } from 'antd';
import { getArticlePage } from '@/api/articleController';
import { getTagPage } from '@/api/tagController';
import { getColumnPage } from '@/api/columnController';
import ArticleList from '@/components/ArticleList/page';
import Sidebar from '@/components/Sidebar/page';
import TagCard from '@/components/TagCard/page';
import Link from 'next/link';

interface HomeArticlesClientProps {
  initialData: API.ArticleVo[];
  initialTotal: number;
  initialPageSize?: number;
}

export default function HomeArticlesClient({ initialData, initialTotal, initialPageSize = 20 }: HomeArticlesClientProps) {
  const PAGE_SIZE = initialPageSize;

  const [data, setData] = useState<API.ArticleVo[]>(initialData);
  const [total, setTotal] = useState<number>(initialTotal);
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // 标签与专栏数据
  const [tags, setTags] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState<boolean>(false);

  useEffect(() => {
    setData(initialData);
    setTotal(initialTotal);
    setCurrent(1);
  }, [initialData, initialTotal]);

  useEffect(() => {
    // 加载标签与专栏（仅首页）
    const fetchTaxonomy = async () => {
      setLoadingTaxonomy(true);
      try {
        const [tagRes, columnRes] = (await Promise.all([
          getTagPage({ current: 1, pageSize: 200 }),
          getColumnPage({ current: 1, pageSize: 200 }),
        ])) as any[];

        const tagRecords = tagRes?.data?.records || [];
        const columnRecords = columnRes?.data?.records || [];
        setTags(tagRecords);
        setColumns(columnRecords);
      } catch (e) {
        console.error('获取标签/专栏失败', e);
      } finally {
        setLoadingTaxonomy(false);
      }
    };

    fetchTaxonomy();
  }, []);

  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const res = (await getArticlePage({ current: page, pageSize: PAGE_SIZE })) as any;
      const records: API.ArticleVo[] = res?.data?.records || [];
      const totalCount: number = res?.data?.total || 0;
      setData(records);
      setTotal(totalCount);
      setCurrent(page);
    } catch (e) {
      console.error('获取文章分页失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page === current) return;
    fetchPage(page);
  };

  // 将 API.TagVo 映射为 TagCard 需要的轻量结构
  const mappedTags = (tags || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    color: t.color || '#eef0f3',
    articleCount: t.articleCount ?? 0,
    followCount: t.followCount ?? 0,
    icon: t.icon || '',
  }));

  return (
    <div className="page-layout home-page">
      <div className="main-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <ArticleList articles={data} showPagination={false} pageSize={PAGE_SIZE} />
        )}

        <div className="pagination-wrapper" style={{ marginTop: 16 }}>
          <Pagination
            current={current}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(t, [s, e]) => `${s}-${e} 共 ${t} 篇文章`}
          />
        </div>
      </div>

      <div className="sidebar-content">
        <Sidebar />

        {/* 全部标签 */}
        <Card
          title={
            <span>
              🏷️ 全部标签
            </span>
          }
          className="sidebar-tags-card"
          size="small"
          style={{ marginTop: 20 }}
        >
          {loadingTaxonomy ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <Spin size="small" />
            </div>
          ) : mappedTags.length > 0 ? (
            <TagCard tags={mappedTags as any} />
          ) : (
            <div style={{ color: '#999', fontSize: 13 }}>暂无标签</div>
          )}
        </Card>

        {/* 全部专栏 */}
        <Card
          title={
            <span>
              📚 全部专栏
            </span>
          }
          className="sidebar-columns-card"
          size="small"
          style={{ marginTop: 20 }}
        >
          {loadingTaxonomy ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <Spin size="small" />
            </div>
          ) : (columns || []).length > 0 ? (
            <div className="columns-list">
              {(columns || []).map((c: any) => (
                <Link key={c.id} href={`/column/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div className="columns-list-item" title={c.name}>
                    <span className="columns-dot" aria-hidden>•</span>
                    <span className="columns-name">{c.name}</span>
                    <span className="columns-count">{c.articleCount ?? 0} 篇</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ color: '#999', fontSize: 13 }}>暂无专栏</div>
          )}
        </Card>
      </div>
    </div>
  );
}