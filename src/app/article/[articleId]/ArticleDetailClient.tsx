"use client";
import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { Alert, Card, Col, Divider, Empty, Row, Space, Spin, Tag } from "antd";
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
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/page";
import CommentSection from "@/components/CommentSection/page";
import CodeBlock from "@/components/CodeBlock/page";
import { useLoading } from "@/contexts/LoadingContext";
import { formatDate } from "@/utils";
import { useSiteSettings } from "@/stores/siteSettingsStore";
import { getRecommendArticles } from "@/api/articleController";
import LoadingLink from "@/components/LoadingLink";
import AuthorSupportCard from "@/components/AuthorSupportCard";
import Image from "next/image";
import {
  useAuthorProfile,
  useAuthorProfileLoading,
  useFetchAuthorProfile,
} from "@/stores/authorProfileStore";

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

export default function ArticleDetailClient({
  article,
  tocItems,
}: ArticleDetailClientProps) {
  const { finishPageTransition } = useLoading();
  const settings = useSiteSettings();
  const authorProfile = useAuthorProfile();
  const authorLoading = useAuthorProfileLoading();
  const fetchAuthorProfile = useFetchAuthorProfile();
  const siteTitle = settings?.siteName || "Smart Blog";
  const pageTitle = article?.title
    ? `${article.title} - ${siteTitle}`
    : siteTitle;
  const metaDescription =
    article?.excerpt ||
    settings?.seoDescription ||
    settings?.siteDescription ||
    "精彩内容正在加载";
  const authorName = authorProfile?.username || settings?.siteName || "站点作者";
  const authorAvatar =
    authorProfile?.userAvatar ||
    settings?.aboutImage ||
    settings?.siteLogo ||
    "/assets/avatar.svg";
  const authorBio =
    authorProfile?.profile || settings?.siteDescription || "感谢阅读，欢迎交流。";

  useEffect(() => {
    // 页面加载完成后调用finishPageTransition
    finishPageTransition();
  }, [finishPageTransition]);

  useEffect(() => {
    if (!authorProfile) {
      fetchAuthorProfile();
    }
  }, [authorProfile, fetchAuthorProfile]);

  const headingCounts = new Map<string, number>();
  const [recommendedArticles, setRecommendedArticles] = useState<
    API.ArticleVo[]
  >([]);
  const [recommendLoading, setRecommendLoading] = useState(false);

  useEffect(() => {
    if (!article?.id) return;
    const fetchRecommend = async () => {
      setRecommendLoading(true);
      try {
        const res: any = await getRecommendArticles({
          articleId: Number(article.id),
          limit: 6,
        });
        if (res?.code === 0 && Array.isArray(res?.data)) {
          setRecommendedArticles(res.data);
        } else {
          setRecommendedArticles([]);
        }
      } catch {
        setRecommendedArticles([]);
      } finally {
        setRecommendLoading(false);
      }
    };
    fetchRecommend();
  }, [article?.id]);

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>抱歉，您访问的文章不存在或已被删除。</span>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
      </Head>
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
                    <Alert
                      icon={<OpenAIOutlined />}
                      message="文章摘要"
                      description={article.excerpt}
                      type="info"
                      showIcon
                    />
                  </div>

                  <div className="article-detail-meta-top">
                    <Space size={16}>
                      <span className="meta-item article-meta-author">
                        <Avatar
                          size={32}
                          src={authorAvatar}
                          alt={authorName}
                          style={{ marginRight: 8 }}
                        />
                        {authorLoading && !authorProfile
                          ? "加载作者信息..."
                          : authorName}
                      </span>
                      <span className="meta-item">
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {formatDate(
                          article.publishedTime || article.createTime
                        )}
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

                  <Paragraph type="secondary" className="article-author-bio">
                    {authorLoading && !authorProfile
                      ? "作者简介加载中..."
                      : authorBio}
                  </Paragraph>

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
                    components={
                      {
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
                          const { inline, className, children, ...rest } =
                            props;
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : "";

                          if (!inline) {
                            return (
                              <CodeBlock
                                language={language || undefined}
                                showLineNumbers
                              >
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
                      } as Components
                    }
                  >
                    {article.content || "暂无内容"}
                  </ReactMarkdown>
                </div>

                <Divider />

                {/* 作者信息 & 打赏 */}
                <div className="article-reward" style={{ margin: "32px 0" }}>
                  <AuthorSupportCard />
                </div>

                <Divider />

                {/* 推荐文章 */}
                <div className="article-detail-footer">
                  <Card
                    title={
                      <Space size={8}>
                        <Image
                          src="/assets/recommend.svg"
                          alt="推荐"
                          width={20}
                          height={20}
                        />
                        <span>推荐文章</span>
                      </Space>
                    }
                    style={{ marginBottom: 16 }}
                  >
                    {recommendLoading ? (
                      <Spin />
                    ) : recommendedArticles.length === 0 ? (
                      <Empty
                        description="暂无推荐"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ) : (
                      <Row gutter={[16, 16]}>
                        {recommendedArticles.map((item) => (
                          <Col key={item.id} xs={24} sm={12}>
                            <LoadingLink
                              href={`/article/${item.id}`}
                              className="related-item-link"
                            >
                              <Card hoverable size="small" bordered>
                                <Title level={5} style={{ marginBottom: 8 }}>
                                  {item.title}
                                </Title>
                                <Paragraph
                                  type="secondary"
                                  ellipsis={{ rows: 2 }}
                                  style={{ minHeight: 44 }}
                                >
                                  {item.excerpt ||
                                    item.seoDescription ||
                                    "点击查看详情"}
                                </Paragraph>
                                <Space size={12} className="related-meta">
                                  <span>
                                    <CalendarOutlined
                                      style={{ marginRight: 4 }}
                                    />
                                    {formatDate(
                                      item.publishedTime || item.createTime
                                    )}
                                  </span>
                                  {typeof item.views === "number" && (
                                    <span>
                                      <EyeOutlined style={{ marginRight: 4 }} />
                                      {item.views}
                                    </span>
                                  )}
                                </Space>
                              </Card>
                            </LoadingLink>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card>
                </div>

                <Divider />

                {/* 评论区 */}
                <CommentSection articleId={article.id || ""} />
              </article>
            </Col>

            {/* 右侧侧边栏 */}
            <Col xs={24} lg={8}>
              <div className="article-detail-sidebar">
                <Card
                  title="📋 目录"
                  style={{ marginBottom: 16 }}
                  className="toc-card"
                >
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
    </>
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
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const ArticleOutline: React.FC<{ tocItems: TocItem[] }> = ({ tocItems }) => {
  const [activeHash, setActiveHash] = useState<string>(
    () => tocItems[0]?.href ?? ""
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!tocItems.length) return;
    if (typeof window !== "undefined" && window.location.hash) {
      return;
    }
    setActiveHash(tocItems[0]?.href ?? "");
  }, [tocItems]);

  const scrollToHash = useCallback(
    (hash: string, updateHistory = true) => {
      if (typeof window === "undefined") return;
      if (!hash) return;

      const raw = hash.startsWith("#") ? hash.slice(1) : hash;
      const decodedId = decodeURIComponent(raw);
      const target = document.getElementById(decodedId);

      if (!target) return;

      const nav = document.querySelector<HTMLElement>(".front-navigation");
      const navHeight = nav ? nav.getBoundingClientRect().height : 0;
      const gap = 16;
      const { top } = target.getBoundingClientRect();
      const scrollTop = top + window.scrollY - navHeight - gap;

      window.scrollTo({
        top: Math.max(scrollTop, 0),
        behavior: "smooth",
      });

      if (updateHistory && window.location.hash !== `#${decodedId}`) {
        if (typeof window.history.replaceState === "function") {
          window.history.replaceState(
            null,
            "",
            `${pathname || window.location.pathname}#${decodedId}`
          );
        } else if (pathname) {
          router.replace(`${pathname}#${decodedId}`, { scroll: false });
        } else {
          window.history.pushState(null, "", `#${decodedId}`);
        }
      }

      setActiveHash(`#${decodedId}`);
    },
    [pathname, router]
  );

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
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );

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
    if (!hash) return;
    const timer = window.setTimeout(() => scrollToHash(hash, false), 80);
    setActiveHash(hash);
    return () => window.clearTimeout(timer);
  }, [scrollToHash]);

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
          const isActive =
            activeHash === item.href || activeHash === decodeURI(item.href);
          const itemClass = `toc-level-${item.level}${
            isActive ? " active" : ""
          }`;
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
