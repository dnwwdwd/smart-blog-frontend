import React from "react";
import { Card, Avatar } from "antd";
import { LikeOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { getArticlePage } from "@/api/articleController";
import { formatDate } from "@/utils";
import "./styles.css";

const MAX_RECOMMENDATIONS = 5;

const RecommendedArticlesSidebar = async () => {
  let articles: API.ArticleVo[] = [];

  try {
    const res = (await getArticlePage({ current: 1, pageSize: MAX_RECOMMENDATIONS, sortField: "views" })) as any;
    const records: API.ArticleVo[] = res?.data?.records || [];
    articles = records
      .filter((item) => item.title)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, MAX_RECOMMENDATIONS);
  } catch (error) {
    console.error("获取推荐文章失败", error);
  }

  return (
    <Card
      title={
        <span className="recommended-title" aria-label="推荐文章">
          <LikeOutlined /> 推荐阅读
        </span>
      }
      className="recommended-card"
    >
      {articles.length === 0 ? (
        <div className="recommended-empty">暂时没有推荐文章</div>
      ) : (
        <div className="recommended-list">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              prefetch={false}
              className="recommended-item"
            >
              <div className="recommended-cover" aria-hidden="true">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt=""
                    width={64}
                    height={64}
                    sizes="(max-width: 768px) 48px, 64px"
                    unoptimized
                  />
                ) : (
                  <Avatar shape="square" size={64} icon={<LikeOutlined />} />
                )}
              </div>
              <div className="recommended-content">
                <h4 title={article.title || ""}>{article.title}</h4>
                <div className="recommended-meta">
                  {article.publishedTime && (
                    <span>{formatDate(article.publishedTime)}</span>
                  )}
                  <span>{(article.views || 0).toLocaleString()} 阅读</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecommendedArticlesSidebar;
