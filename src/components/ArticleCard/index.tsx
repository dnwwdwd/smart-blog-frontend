"use client";

import React, { useMemo, useState } from "react";
import { Card, Tag, Typography } from "antd";
import { CalendarOutlined, EyeOutlined, ClockCircleOutlined } from "@ant-design/icons";
import Image from "next/image";
import LoadingLink from "@/components/LoadingLink";
import { formatDate } from "@/utils";
import "./styles.css";

const { Title } = Typography;

interface ArticleCardProps {
  article: API.Article | API.ArticleVo;
  showAuthor?: boolean; // ignore
  showViews?: boolean;
}

export default function ArticleCard({ article, showViews = true }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);

  const publishedLabel = useMemo(() => {
    const publishedTime = (article as any).publishedTime || (article as any).createTime;
    return publishedTime ? formatDate(new Date(publishedTime)) : "未发布";
  }, [article]);

  const tags = useMemo(() => {
    if ((article as any).tags && Array.isArray((article as any).tags)) {
      return (article as any).tags.slice(0, 4);
    }
    return [];
  }, [article]);

  const excerpt = useMemo(() => {
    const raw = (article as any).excerpt?.toString?.() ?? "";
    return raw.trim();
  }, [article]);

  const hasTags = tags.length > 0;
  const hasExcerpt = excerpt.length > 0;

  return (
    <Card
      className="article-card"
      hoverable
      cover={
        !imgError && (article as any).coverImage ? (
          <div className="article-cover">
            <Image
              src={(article as any).coverImage}
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
    >
      <div className="article-content">
        <div className="article-meta">
          <span className="meta-item">
            <CalendarOutlined />
            <span>{publishedLabel}</span>
          </span>
          {showViews && (
            <span className="meta-item">
              <EyeOutlined />
              <span>{(article as any).views ?? 0}</span>
            </span>
          )}
        </div>

        <LoadingLink href={`/article/${(article as any).id}`} className="article-link">
          <Title level={4} className="article-title" ellipsis={{ rows: 2 }}>
            {article.title}
          </Title>
        </LoadingLink>

        <p
          className={`article-excerpt${hasExcerpt ? "" : " is-empty"}`}
          aria-hidden={!hasExcerpt}
        >
          {hasExcerpt ? excerpt : "占位"}
        </p>

        <div className={`article-tags${hasTags ? "" : " is-empty"}`} aria-hidden={!hasTags}>
          {tags.map((tag: string) => (
            <Tag key={tag} className="article-tag">
              {tag}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  );
}
