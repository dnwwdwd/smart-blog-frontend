"use server";
import React from "react";
import ArticleList from "@/components/ArticleList/page";
import Sidebar from "@/components/Sidebar/page";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import "./styles.css";
import { getArticlePage } from "@/api/articleController";

export default async function ArticlesPage() {
  let articleList = [];

  const res = await getArticlePage({
    current: 1,
    pageSize: 10,
  });

  articleList = res.data?.records || [];

  return (
    <div className="articles-page">
      <div className="container">
        <div className="articles-header mb-6">
          <Title level={2}>📚 文章列表</Title>
          <Paragraph type="secondary">分享技术心得，记录学习历程</Paragraph>
        </div>

        <div className="page-layout">
          {/* 主内容区 */}
          <div className="main-content">
            <ArticleList articles={articleList} />
          </div>

          {/* 侧边栏 */}
          <div className="sidebar-content">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
