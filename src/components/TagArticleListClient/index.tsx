"use client";

import React, { useState, createContext, useContext, useEffect } from "react";
import { getArticlePageByTagId } from "@/api/articleController";
import ArticleList from "@/components/ArticleList/page";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";

// 创建 Context 来传递数据
interface TagArticlesContextType {
  data: API.ArticleVo[];
  loading: boolean;
}

const TagArticlesContext = createContext<TagArticlesContextType | undefined>(
  undefined
);

export const useTagArticlesData = () => {
  const context = useContext(TagArticlesContext);
  if (!context) {
    throw new Error(
      "useTagArticlesData must be used within TagArticleListClient"
    );
  }
  return context;
};

interface TagArticleListClientProps {
  tagId: string;
}

export default function TagArticleListClient({
  tagId,
}: TagArticleListClientProps) {
  const [data, setData] = useState<API.ArticleVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // 初始加载数据
  useEffect(() => {
    loadInitialData();
  }, [tagId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const params = {
        current: 1,
        pageSize: 20,
      };

      const response: any = await getArticlePageByTagId(
        { tagId: parseInt(tagId) },
        params
      );
      const pageData = response?.data;

      if (pageData?.records) {
        const articles = pageData.records as API.ArticleVo[];
        setData(articles);
        const totalCount = pageData.total || 0;
        setTotal(totalCount);
        const reachedEnd = articles.length < 20 || articles.length >= totalCount;
        setHasMore(!reachedEnd);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to load tag articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = currentPage + 1;
      const params = {
        current: nextPage,
        pageSize: 20,
      };

      const response = (await getArticlePageByTagId(
        { tagId: parseInt(tagId) },
        params
      )) as any;
      const pageData = response?.data;

      if (pageData?.records) {
        const newData = pageData.records as API.ArticleVo[];
        setData((prev) => [...prev, ...newData]);
        setCurrentPage(nextPage);
        const totalCount = pageData.total || 0;
        setTotal(totalCount);
        const reachedEnd = newData.length < 20 || (data.length + newData.length) >= totalCount;
        setHasMore(!reachedEnd);
      }
    } catch (error) {
      console.error("Failed to load more tag articles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TagArticlesContext.Provider value={{ data, loading }}>
      <InfiniteScrollContainer
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      >
        <ArticleList articles={data} showPagination={false} />
      </InfiniteScrollContainer>
    </TagArticlesContext.Provider>
  );
}
