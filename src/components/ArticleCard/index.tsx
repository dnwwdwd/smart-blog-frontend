"use client";

import React, { useState } from "react";
import { Card, Tag, Space, Avatar, Typography } from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink";
import { formatDate } from "@/utils";
import "./styles.css";

const { Title, Paragraph } = Typography;

interface ArticleCardProps {
  article: API.Article | API.ArticleVo;
  showAuthor?: boolean;
  showViews?: boolean;
}

export default function ArticleCard({
  article,
  showAuthor = false,
  showViews = true,
}: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      className="article-card"
      hoverable
      cover={
        !imgError && article.coverImage ? (
          <div className="article-cover">
            <Image
              src={article.coverImage}
              alt={article.title || ""}
              width={400}
              height={200}
              style={{ objectFit: "cover" }}
              onError={() => setImgError(true)}
              unoptimized
              priority={false}
            />
          </div>
        ) : (
          <div className="article-cover-placeholder">
            <div className="placeholder-content">
              <ClockCircleOutlined className="placeholder-icon" />
              <span>暂无封面</span>
            </div>
          </div>
        )
      }
      actions={[
        <Space key="date" size="small">
          <CalendarOutlined />
          <span>
            {article.publishedTime
              ? formatDate(new Date(article.publishedTime))
              : "未知时间"}
          </span>
        </Space>,
        ...(showViews
          ? [
              <Space key="views" size="small">
                <EyeOutlined />
                <span>{(article as any).views || 0}</span>
              </Space>,
            ]
          : []),
        ...(showAuthor
          ? [
              <Space key="author" size="small">
                <Avatar size="small" icon={<UserOutlined />} />
                <span>{(article as any).author || "匿名"}</span>
              </Space>,
            ]
          : []),
      ]}
    >
      <div className="article-content">
        <LoadingLink href={`/article/${article.id}`} className="article-link">
          <Title level={4} className="article-title" ellipsis={{ rows: 2 }}>
            {article.title}
          </Title>
        </LoadingLink>

        <Paragraph
          className="article-excerpt"
          ellipsis={{ rows: 3 }}
          style={{ marginBottom: 16 }}
        >
          {article.excerpt || "暂无摘要"}
        </Paragraph>

        {/* 标签 */}
        <div className="article-tags">
          {("tags" in article ? article.tags : [])?.slice(0, 3).map((tag: string) => (
            <Tag key={tag} className="article-tag">
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
}