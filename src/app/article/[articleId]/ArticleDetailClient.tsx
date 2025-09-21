"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Card, Col, Divider, Row, Space, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  OpenAIOutlined,
} from "@ant-design/icons";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
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

type TocItem = {
  key: string;
  href: string;
  title: string;
  level: number;
};

interface ArticleDetailClientProps {
  article: any;
  tocItems: TocItem[];
}

export default function ArticleDetailClient({ article, tocItems }: ArticleDetailClientProps) {
  const { finishPageTransition } = useLoading();

  useEffect(() => {
    // 页面加载完成后调用finishPageTransition
    finishPageTransition();
  }, [finishPageTransition]);

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>抱歉，您访问的文章不存在或已被删除。</span>
      </div>
    );
  }

  const headingCounts = new Map<string, number>();

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
                  rehypePlugins={[rehypeRaw]}
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
                        <h3 id={slug} {...props}>
                          {children}
                        </h3>
                      );
                    },
                    h4: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <h4 id={slug} {...props}>
                          {children}
                        </h4>
                      );
                    },
                    h5: ({ children, ...props }) => {
                      const text = extractText(children);
                      const base = slugify(text);
                      const c = (headingCounts.get(base) || 0) + 1;
                      headingCounts.set(base, c);
                      const slug = c > 1 ? `${base}-${c}` : base;
                      return (
                        <h5 id={slug} {...props}>
                          {children}
                        </h5>
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
                    code: (props: any) => {
                      const { inline, className, children, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      if (!inline) {
                        return (
                          <CodeBlock language={language || undefined} showLineNumbers>
                            {children as React.ReactNode}
                          </CodeBlock>
                        );
                      }

                      return (
                        <code className={className} {...rest}>
                          {children}
                        </code>
                      );
                    },
                  } as Components}
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
                  <ArticleOutline tocItems={tocItems} />
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

const ArticleOutline: React.FC<{ tocItems: TocItem[] }> = ({ tocItems }) => {
  const [activeHash, setActiveHash] = useState<string>(() => tocItems[0]?.href ?? "");

  useEffect(() => {
    if (!tocItems.length) return;
    if (typeof window !== "undefined" && window.location.hash) {
      return;
    }
    setActiveHash(tocItems[0]?.href ?? "");
  }, [tocItems]);

  const scrollToHash = useCallback((hash: string, updateHistory = true) => {
    if (typeof window === "undefined") return;
    if (!hash) return;

    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    const decodedId = decodeURIComponent(raw);
    const target = document.getElementById(decodedId);

    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });

    if (updateHistory && window.location.hash !== `#${decodedId}`) {
      window.history.pushState(null, "", `#${decodedId}`);
    }

    setActiveHash(`#${decodedId}`);
  }, []);

  useEffect(() => {
    if (!tocItems.length || typeof window === "undefined") return;

    const headings = tocItems
      .map((item) => document.getElementById(item.href.replace(/^#/, "")))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);

        if (inView.length > 0) {
          const id = inView[0].target.id;
          setActiveHash(`#${id}`);
        } else {
          const first = headings[0];
          if (first) {
            const rect = first.getBoundingClientRect();
            if (rect.top > 0) {
              setActiveHash(`#${first.id}`);
            }
          }
        }
      },
      {
        rootMargin: "-72px 0px -60% 0px",
        threshold: [0, 0.2, 0.4],
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
      observer.disconnect();
    };
  }, [tocItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash) {
      const handle = window.requestAnimationFrame(() => {
        scrollToHash(hash, false);
      });
      setActiveHash(hash);
      return () => window.cancelAnimationFrame(handle);
    }
  }, [tocItems, scrollToHash]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => {
      const hash = window.location.hash;
      if (hash) {
        scrollToHash(hash, false);
      }
    };

    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [scrollToHash]);

  if (!tocItems.length) {
    return null;
  }

  return (
    <nav className="custom-toc" aria-label="文章目录">
      <ul>
        {tocItems.map((item) => {
          const isActive = activeHash === item.href || activeHash === decodeURI(item.href);
          const itemClass = `toc-level-${item.level}${isActive ? " active" : ""}`;
          const linkClass = isActive ? "active" : undefined;
          return (
            <li key={item.key} className={itemClass}>
              <a
                href={item.href}
                className={linkClass}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToHash(item.href);
                }}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
