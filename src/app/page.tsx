import React from "react";
import { getColumnPage } from "@/api/columnController";
import "@ant-design/v5-patch-for-react-19";
import "./styles.css";
import Sidebar from "@/components/Sidebar/page";
import AllTagsSidebar from "@/components/AllTagsSidebar";
import RecommendedArticlesSidebar from "@/components/RecommendedArticlesSidebar";
import HomeColumnBar from "@/components/HomeColumnBar";
import { getArticlePage } from "@/api/articleController";
import HomeHero from "@/components/HomeHero";

export default async function HomePage() {
  // 服务端获取专栏列表（第一页，用于首页 Tab）
  const columnsRes = (await getColumnPage({ current: 1, pageSize: 10 })) as any;
  const initialColumns: API.ColumnVo[] = columnsRes?.data?.records || [];
  const initialTotal: number = columnsRes?.data?.total || 0;

  // 首屏默认展示"全部文章"
  let initialArticles: API.ArticleVo[] = [];
  try {
    const pageRes = (await getArticlePage({ current: 1, pageSize: 12 })) as any;
    initialArticles = pageRes?.data?.records || [];
  } catch (e) {
    // 忽略首屏文章预取失败，客户端再拉取
  }

  return (
    <div className="home-page">
      <HomeHero />

      {/* 主体内容：左侧专栏Tab + 右侧侧边栏 */}
      <div className="home-container">
        <div className="page-layout">
          <div className="main-content">
            <HomeColumnBar
              initialColumns={initialColumns}
              initialTotal={initialTotal}
              initialArticles={initialArticles}
              initialActiveColumnId={"all"}
            />
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
