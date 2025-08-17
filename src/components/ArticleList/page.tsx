"use client";

import React, { useState } from "react";
import { List, Pagination, Space, Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import "./styles.css";
import { formatDate } from "@/utils";
import Article = API.Article;
import ArticleVo = API.ArticleVo;

interface ArticleListProps {
  articles?: (Article | ArticleVo)[]; // 支持Article和ArticleVo类型
  showPagination?: boolean; // 是否显示分页
  pageSize?: number; // 每页显示数量
}

export default function ArticleList({
  articles = [],
  showPagination = true,
  pageSize = 6,
}: ArticleListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 计算当前页显示的文章
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentArticles = articles.slice(startIndex, endIndex);

  return (
    <div>
      <List
        className="article-list"
        itemLayout="horizontal"
        size="large"
        dataSource={currentArticles}
        renderItem={(article) => (
          <ArticleItem key={article.id} article={article} />
        )}
      />

      {showPagination && articles.length > pageSize && (
        <div
          className="pagination-wrapper"
          style={{ textAlign: "center", marginTop: 24 }}
        >
          <Pagination
            current={currentPage}
            total={articles.length}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} 共 ${total} 篇文章`
            }
          />
        </div>
      )}
    </div>
  );
}

function ArticleItem({ article }: { article: Article | ArticleVo }) {
  const [imgError, setImgError] = useState(false);

  return (
    <List.Item className="article-item" key={article.id}>
      <List.Item.Meta
        avatar={
          !imgError && article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title || ''}
              width={200}
              height={150}
              style={{ objectFit: "cover", borderRadius: "8px" }}
              onError={() => setImgError(true)}
              unoptimized
              priority={false}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 150,
                backgroundColor: "#f0f0f0",
                color: "#999",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              图片加载失败
            </div>
          )
        }
        title={
          <Link
            href={`/article/${article.id}`}
            style={{ textDecoration: "none" }}
          >
            <Title
              level={4}
              className="article-title"
              style={{ margin: 0, fontSize: "18px", color: "#1a1a1a" }}
            >
              {article.title}
            </Title>
          </Link>
        }
        description={
          <>
            <Paragraph
              className="article-excerpt"
              style={{ marginBottom: 16, color: "#666" }}
            >
              {article.excerpt}
            </Paragraph>

            <div className="article-meta" style={{ marginBottom: 16 }}>
              <Space size="small">
                <CalendarOutlined style={{ color: "#999" }} />
                <span style={{ color: "#999" }}>
                  {article.publishedTime ? formatDate(new Date(article.publishedTime)) : '未知时间'}
                </span>
              </Space>
            </div>

            <div className="article-tags" style={{ marginTop: 16 }}>
              {('tags' in article ? article.tags : [])?.map((tag: string) => (
                <Tag key={tag}>
                  {tag}
                </Tag>
              ))}
            </div>
          </>
        }
      />
    </List.Item>
  );
}
