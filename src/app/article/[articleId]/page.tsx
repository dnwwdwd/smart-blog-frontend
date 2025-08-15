"use server";
import React from "react";
import { Alert, Anchor, Card, Col, Divider, Row, Space, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Sidebar from "@/components/Sidebar/page";
import ArticleList from "@/components/ArticleList/page";
import CommentSection from "@/components/CommentSection/page";
import CodeBlock from "@/components/CodeBlock/page";
import "./styles.css";
import "highlight.js/styles/github.css";
import { getArticleVoById } from "@/api/articleController";
import { formatDate } from "@/utils";

interface ArticlePageProps {
  params: Promise<{
    articleId: string;
  }>;
}

// 生成目录的函数
const generateTOC = (content: string) => {
  if (!content || typeof content !== "string") {
    return [];
  }

  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  return headings.map((heading, index) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const text = heading.replace(/^#+\s+/, "");
    const href = `#heading-${index}`;
    return {
      key: href,
      href,
      title: text,
      level,
    };
  });
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = await params;
  let article: any = null;

  try {
    const res = await getArticleVoById({ articleId });
    article = res.data;
    console.log(article);
  } catch (error) {
    console.log(error);
  }

  // 生成目录 - 确保 content 存在
  const tocItems = article?.content ? generateTOC(article.content) : [];

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>抱歉，您访问的文章不存在或已被删除。</span>
      </div>
    );
  }

  return (
    <div className="article-page">
      <div className="article-container">
        <Row gutter={[24, 24]}>
          {/* 左侧文章内容 */}
          <Col xs={24} lg={16}>
            <article className="article-content">
              {/* 文章头部 */}
              <header className="article-header">
                <Title level={1} className="article-title">
                  {article.title}
                </Title>

                {/* 文章摘要 */}
                <div className="article-excerpt">
                  <Alert description={article.excerpt} type="info" />
                </div>

                <div className="article-meta-top">
                  <Space size={16}>
                    <span className="meta-item">
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {formatDate(article.publishedTime || article.createTime)}
                    </span>
                    <span className="meta-item">
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {article.readTime} 分钟
                    </span>
                    <span className="meta-item">
                      <EyeOutlined style={{ marginRight: 4 }} />
                      {article.views}
                    </span>
                  </Space>
                </div>

                <div className="article-tags">
                  {article.tags && article.tags.length > 0
                    ? article.tags.map((tag: string) => (
                        <Tag key={tag} color="blue">
                          {tag}
                        </Tag>
                      ))
                    : ""}
                </div>
              </header>

              <Divider />

              {/* 文章正文 */}
              <div className="article-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children, ...props }) => (
                      <Title
                        level={1}
                        id={`heading-${tocItems.findIndex(
                          (item) => item.title === children
                        )}`}
                      >
                        {children}
                      </Title>
                    ),
                    h2: ({ children, ...props }) => (
                      <Title
                        level={2}
                        id={`heading-${tocItems.findIndex(
                          (item) => item.title === children
                        )}`}
                      >
                        {children}
                      </Title>
                    ),
                    h3: ({ children, ...props }) => (
                      <Title
                        level={3}
                        id={`heading-${tocItems.findIndex(
                          (item) => item.title === children
                        )}`}
                      >
                        {children}
                      </Title>
                    ),
                    h4: ({ children, ...props }) => (
                      <Title
                        level={4}
                        id={`heading-${tocItems.findIndex(
                          (item) => item.title === children
                        )}`}
                      >
                        {children}
                      </Title>
                    ),
                    p: ({ children }) => <Paragraph>{children}</Paragraph>,
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const isInline = !className || !language;

                      if (!isInline && language) {
                        return (
                          <CodeBlock language={language}>
                            {String(children).replace(/\n$/, "")}
                          </CodeBlock>
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {article.content || "暂无内容"}
                </ReactMarkdown>
              </div>

              <Divider />

              {/* 相关文章 */}
              <div className="article-footer">
                <Card title="📚 相关文章" style={{ marginBottom: 16 }}>
                  <ArticleList showPagination={false} pageSize={3} />
                </Card>
              </div>

              <Divider />

              {/* 评论区 */}
              <CommentSection articleId={article.id} />
            </article>
          </Col>

          {/* 右侧侧边栏 */}
          <Col xs={24} lg={8}>
            <div className="article-sidebar">
              <Card title="📋 目录" style={{ marginBottom: 16 }}>
                {tocItems.length > 0 ? (
                  <Anchor affix={false} items={tocItems} offsetTop={80} />
                ) : (
                  <p>暂无目录</p>
                )}
              </Card>

              <Sidebar />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
