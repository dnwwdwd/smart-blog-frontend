"use server";
import React from "react";
import { getArticlePage } from "@/api/articleController";
import ArticlesPageClient from "@/components/ArticlesPageClient";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";

const ArticlesPage = async () => {
  // 服务端渲染：获取初始数据
  const initialResponse = (await getArticlePage({
    current: 1,
    pageSize: 20,
  })) as any;

  const initialData = initialResponse?.data?.records || [];
  const initialTotal = initialResponse?.data?.total || 0;

  return (
    <div className="articles-page">
      <div className="container">
        <div className="articles-header mb-6">
          <h1>📚 文章列表</h1>
        </div>
        <ArticlesPageClient
          initialData={initialData}
          initialTotal={initialTotal}
        />
      </div>
    </div>
  );
};

export default ArticlesPage;
