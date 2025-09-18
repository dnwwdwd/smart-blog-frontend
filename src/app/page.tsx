import React from "react";
import { getColumnPage } from "@/api/columnController";
import "@ant-design/v5-patch-for-react-19";
import "./styles.css";
import ColumnTabs from "@/components/ColumnTabs";
import Sidebar from "@/components/Sidebar/page";
import AllTagsSidebar from "@/components/AllTagsSidebar";
import RecommendedArticlesSidebar from "@/components/RecommendedArticlesSidebar";

export default async function HomePage() {
  // 服务端获取专栏列表（第一页）
  const columnsRes = (await getColumnPage({ current: 1, pageSize: 8 })) as any;
  const initialColumns: API.ColumnVo[] = columnsRes?.data?.records || [];
  const initialTotal: number = columnsRes?.data?.total || 0;

  return (
    <div className="home-page">
      {/* 顶部横幅/英雄区 */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <h1 className="home-title">Smart Blog</h1>
          <p className="home-subtitle">记录知识与灵感，分享技术与故事</p>
        </div>
      </section>

      {/* 主体内容：左侧专栏Tab + 右侧侧边栏 */}
      <div className="home-container">
        <div className="home-header mb-6">
          <h2>专栏</h2>
        </div>
        <div className="page-layout">
          <div className="main-content">
            <ColumnTabs initialColumns={initialColumns} initialTotal={initialTotal} />
          </div>
          <div className="sidebar-content">
            {/* 推荐文章置于最上方 */}
            <RecommendedArticlesSidebar />
            {/* 原 Sidebar 其后 */}
            <Sidebar />
            {/* 全部标签卡片保持统一间距 */}
            <AllTagsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}