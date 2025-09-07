"use client";
import React, { useEffect } from "react";
import { Alert, Card, Col, Divider, Row, Space, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  OpenAIOutlined,
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
import RewardModal from "@/components/RewardModal";
import { useLoading } from "@/contexts/LoadingContext";
import { formatDate } from "@/utils";

interface ArticleDetailClientProps {
  article: any;
  tocItems: any[];
}

export default function ArticleDetailClient({ article, tocItems }: ArticleDetailClientProps) {
  const { finishPageTransition } = useLoading();

  useEffect(() => {
    // 页面加载完成后调用finishPageTransition
    finishPageTransition();
  }, [finishPageTransition]);

  // 生成目录 - 确保 content 存在
  const headingCounts = new Map<string, number>();

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>抱歉，您访问的文章不存在或已被删除。</span>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
       <div className="article-detail-container">
        <Row gutter={[24, 24]}>
          {/* 左侧文章内容 */}
          <Col xs={24} lg={16}>
            <article className="article-detail-content">
              {/* 文章头部 */}
              <div className="article-detail-header">
                <Title level={1} className="article-detail-title">
                  {article.title}
                </Title>

                {/* 文章摘要 */}
                <div className="article-excerpt">
                  <Alert icon={<OpenAIOutlined/>} message="文章摘要" description={article.excerpt} type="info" showIcon />
                </div>

                <div className="article-detail-meta-top">
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

                <div className="article-detail-tags">
                  {article.tags && article.tags.length > 0
                    ? article.tags.map((tag: string) => (
                        <Tag key={tag} color="blue">
                          {tag}
                        </Tag>
                      ))
                    : ""}
                </div>
              </div>

              {/* 文章正文 */}
              <div className="article-detail-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <Title level={1} id={slug} {...props}>
                          {children}
                        </Title>
                      );
                    },
                    h2: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <Title level={2} id={slug} {...props}>
                          {children}
                        </Title>
                      );
                    },
                    h3: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <Title level={3} id={slug} {...props}>
                          {children}
                        </Title>
                      );
                    },
                    h4: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <Title level={4} id={slug} {...props}>
                          {children}
                        </Title>
                      );
                    },
                    h5: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <Title level={5} id={slug} {...props}>
                          {children}
                        </Title>
                      );
                    },
                    h6: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <h6 id={slug} {...props}>
                          {children}
                        </h6>
                      );
                    },
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

              {/* 打赏支持 */}
              <div className="article-reward" style={{ textAlign: 'center', margin: '32px 0' }}>
                <RewardModal />
              </div>

              <Divider />

              {/* 相关文章 */}
              <div className="article-detail-footer">
                <Card title="📚 相关文章" style={{ marginBottom: 16 }}>
                  <ArticleList showPagination={false} pageSize={3} />
                </Card>
              </div>

              <Divider />

              {/* 评论区 */}
              <CommentSection articleId={article.id || ''} />
            </article>
          </Col>

          {/* 右侧侧边栏 */}
          <Col xs={24} lg={8}>
            <div className="article-detail-sidebar">
              <Card title="📋 目录" style={{ marginBottom: 16 }} className="toc-card">
                {tocItems.length > 0 ? (
                  <nav className="custom-toc" aria-label="文章目录">
                    <ul>
                      {tocItems.map((item) => (
                        <li key={item.key} className={`toc-level-${item.level}`}>
                          <a href={item.href}>{item.title}</a>
                        </li>
                      ))}
                    </ul>
                  </nav>
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

// 生成 slug 的工具方法
const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const anyProps = (node.props as any) || {};
    return extractText(anyProps.children);
  }
  return "";
};

const slugify = (text: string) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // remove html tags if any
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "") // keep letters/numbers/space/-/_
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");