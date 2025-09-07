import React from "react";
import { Card, Space } from "antd";
import { EyeOutlined, FireOutlined } from "@ant-design/icons";
import Link from "next/link";
import { getArticlePage } from "@/api/articleController";
import "./styles.css";

export default async function PopularArticlesSidebar() {
  // 服务端请求热门文章（按浏览量排序）
  let articles: API.ArticleVo[] = [];
  try {
    const res = (await getArticlePage({ current: 1, pageSize: 10, sortField: "views" })) as any;
    const records: API.ArticleVo[] = res?.data?.records || [];
    articles = records
      .filter((a) => typeof a.views === "number")
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  } catch (e) {
    console.error("获取热门文章失败", e);
  }

  return (
    <Card className="popular-articles-card" variant="outlined">
      <div className="popular-header">
        <span className="popular-title">
          <FireOutlined /> 热门文章
        </span>
      </div>

      <div className="popular-list">
        {articles.length === 0 ? (
          <div className="popular-empty">暂无热门文章</div>
        ) : (
          articles.map((item, index) => (
            <div key={item.id ?? index} className="popular-item">
              <div className="rank-badge" aria-label={`第${index + 1}名`}>
                {index + 1}
              </div>
              <div className="popular-content">
                <Link href={`/article/${item.id || ""}`} className="popular-link">
                  <span className="popular-item-title" title={item.title}>
                    {item.title}
                  </span>
                </Link>
                <Space size={8} className="popular-meta">
                  <EyeOutlined />
                  <span>{(item.views || 0).toLocaleString()}</span>
                </Space>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}