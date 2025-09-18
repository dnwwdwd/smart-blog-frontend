"use client";

import React from "react";
import { Row, Col, Typography, Button, Empty } from "antd";
import { RightOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import "./styles.css";

const { Title } = Typography;

interface RecentArticlesProps {
  articles: (API.Article | API.ArticleVo)[];
  showMore?: boolean;
  maxCount?: number;
}

export default function RecentArticles({
  articles = [],
  showMore = true,
  maxCount = 6,
}: RecentArticlesProps) {
  const displayArticles = articles.slice(0, maxCount);

  return (
    <section className="recent-articles-section">
      <div className="section-header">
        <Title level={2} className="section-title">
          <ClockCircleOutlined className="title-icon" />
          最新文章
        </Title>
        {showMore && (
          <Link href="/articles">
            <Button type="link" icon={<RightOutlined />} className="more-button">
              查看更多
            </Button>
          </Link>
        )}
      </div>

      {displayArticles.length > 0 ? (
        <Row gutter={[24, 24]} className="articles-grid">
          {displayArticles.map((article, index) => (
            <Col
              key={article.id}
              xs={24}
              sm={12}
              lg={12}
              xl={8}
              className={`article-col article-col-${index + 1}`}
            >
              <ArticleCard article={article} showViews={true} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-state">
          <Empty
            description="暂无文章"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </section>
  );
}