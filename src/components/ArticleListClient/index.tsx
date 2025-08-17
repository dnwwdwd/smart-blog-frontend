'use client';

import React from 'react';
import ArticleList from '@/components/ArticleList/page';
import { useArticlesData } from '@/components/ArticlesPageClient';

const ArticleListClient: React.FC = () => {
  const { data: articles, loading } = useArticlesData();

  return <ArticleList articles={articles} showPagination={false} />;
};

export default ArticleListClient;