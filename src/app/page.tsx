import React from "react";
import { getArticlePage } from "@/api/articleController";
import HomeArticlesClient from "@/components/HomeArticlesClient";
import "@ant-design/v5-patch-for-react-19";
import "./styles.css";

export default async function HomePage() {
  // 服务端渲染：获取初始文章数据（分页）
  const initialResponse = (await getArticlePage({
    current: 1,
    pageSize: 20,
  })) as any;

  const initialData = initialResponse?.data?.records || [];
  const initialTotal = initialResponse?.data?.total || 0;

  return (
    <div className="home-page">
      {/* 顶部横幅/英雄区 */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <h1 className="home-title">Smart Blog</h1>
          <p className="home-subtitle">记录知识与灵感，分享技术与故事</p>
        </div>
      </section>

      {/* 主体内容：左侧文章列表（分页） + 右侧侧边栏 */}
      <div className="home-container">
        <div className="home-header mb-6">
          <h2>最新文章</h2>
        </div>
        <HomeArticlesClient initialData={initialData} initialTotal={initialTotal} />
      </div>
    </div>
  );
}