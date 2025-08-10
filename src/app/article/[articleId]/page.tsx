"use server";
import React from 'react';
import {Anchor, Card, Col, Divider, Row, Space, Tag} from 'antd';
import {CalendarOutlined, ClockCircleOutlined, EyeOutlined, UserOutlined} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Sidebar from "@/components/Sidebar/page";
import ArticleList from "@/components/ArticleList/page";
import CommentSection from "@/components/CommentSection/page";
import CodeBlock from "@/components/CodeBlock/page";
import './styles.css';
import 'highlight.js/styles/github.css';

// Mock 文章数据 (可以移动到单独的文件中)
const mockArticleData = {
    1: {
        id: 1,
        title: '如何制作加载动画图？在线生成炫酷loading图支持SVG、APNG、GIF',
        excerpt: '在现代Web开发中，加载动画是提升用户体验的重要元素。本文将详细介绍如何制作各种炫酷的加载动画，包括SVG、APNG、GIF等格式的制作方法和最佳实践。',
        content: `# 如何制作加载动画图？

在现代Web开发中，加载动画是提升用户体验的重要元素。本文将详细介绍如何制作各种炫酷的加载动画。

## 什么是加载动画？

加载动画（Loading Animation）是在页面或内容加载过程中显示的视觉反馈，它能够：

- 告知用户系统正在处理请求
- 减少用户等待时的焦虑感
- 提升整体用户体验

## 支持的格式

### SVG格式

SVG（Scalable Vector Graphics）是一种基于XML的矢量图形格式，具有以下优势：

\`\`\`xml
<svg width="50" height="50" viewBox="0 0 50 50">
  <circle cx="25" cy="25" r="20" fill="none" stroke="#3498db" stroke-width="4">
    <animate attributeName="stroke-dasharray" dur="2s" values="0 126;126 126;0 126" repeatCount="indefinite"/>
  </circle>
</svg>
\`\`\`

### APNG格式

APNG（Animated Portable Network Graphics）是PNG的动画扩展：

- 支持透明背景
- 文件体积相对较小
- 兼容性良好

### GIF格式

GIF是最传统的动画格式：

- 广泛支持
- 制作简单
- 适合简单动画

## 制作工具推荐

1. **在线工具**
   - Loading.io
   - Preloaders.net
   - CSS Load.net

2. **设计软件**
   - Adobe After Effects
   - Sketch
   - Figma

## 最佳实践

### 性能优化

- 控制文件大小
- 选择合适的格式
- 考虑移动端性能

### 用户体验

- 动画时长不宜过长
- 保持品牌一致性
- 提供加载进度反馈

## 总结

选择合适的加载动画格式和制作工具，能够显著提升用户体验。建议根据具体需求选择SVG、APNG或GIF格式。`,
        author: '张洪Heo',
        date: '2025-01-01',
        tags: ['前端', '动画', 'SVG'],
        category: '加载动画',
        readTime: '5 分钟阅读',
        views: 1234
    },
    2: {
        id: 2,
        title: '洪哥闪回来了！论坛快捷回复，自动填充随机短语，测览器插件',
        excerpt: '这是一个实用的浏览器插件，帮助用户快速回复论坛内容，提高交流效率。支持自动填充随机短语、自定义回复模板等功能。',
        content: `# 洪哥闪回来了！论坛快捷回复插件

这是一个实用的浏览器插件，帮助用户快速回复论坛内容，提高交流效率。

## 功能特性

- 自动填充随机短语
- 支持自定义回复模板
- 一键快速回复
- 多平台兼容

## 安装方法

1. 下载插件文件
2. 打开浏览器扩展管理页面
3. 启用开发者模式
4. 加载已解压的扩展程序

## 使用说明

插件安装完成后，在支持的论坛页面会自动激活快捷回复功能。`,
        author: '张洪Heo',
        date: '2024-12-28',
        tags: ['插件', '效率工具'],
        category: '浏览器插件',
        readTime: '3 分钟阅读',
        views: 856
    }
};

interface ArticlePageProps {
    params: Promise<{
        articleId: string;
    }>;
}

// 生成目录的函数
const generateTOC = (content: string) => {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    return headings.map((heading, index) => {
        const level = heading.match(/^#+/)?.[0].length || 1;
        const text = heading.replace(/^#+\s+/, '');
        const href = `#heading-${index}`;
        return {
            key: href,
            href,
            title: text,
            level
        };
    });
};

// Metadata generation removed for client-side rendering

export default async function ArticlePage({params}: ArticlePageProps) {
    const {articleId} = await params;
    const article = mockArticleData[Number(articleId) as keyof typeof mockArticleData];
    const tocItems = article ? generateTOC(article.content) : [];

    if (!article) {
        return (
            <div style={{textAlign: 'center', padding: '100px 20px'}}>
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
                                    <Paragraph className="excerpt-text">
                                        {article.excerpt}
                                    </Paragraph>
                                </div>

                                <div className="article-meta-top">
                                    <Space size={16}>
                                        <span className="meta-item">
                                            <CalendarOutlined style={{marginRight: 4}}/>
                                            {article.date}
                                        </span>
                                        <span className="meta-item">
                                            <UserOutlined style={{marginRight: 4}}/>
                                            {article.author}
                                        </span>
                                        <span className="meta-item">
                                            <ClockCircleOutlined style={{marginRight: 4}}/>
                                            {article.readTime}
                                        </span>
                                        <span className="meta-item">
                                            <EyeOutlined style={{marginRight: 4}}/>
                                            {article.views} 次阅读
                                        </span>
                                    </Space>
                                </div>

                                <div className="article-tags">
                                    {article.tags.map((tag: string) => (
                                        <Tag key={tag} color="blue">
                                            {tag}
                                        </Tag>
                                    ))}
                                </div>
                            </header>

                            <Divider/>

                            {/* 文章正文 */}
                            <div className="article-body">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                    components={{
                                        h1: ({children, ...props}) => (
                                            <Title level={1}
                                                   id={`heading-${tocItems.findIndex(item => item.title === children)}`}>
                                                {children}
                                            </Title>
                                        ),
                                        h2: ({children, ...props}) => (
                                            <Title level={2}
                                                   id={`heading-${tocItems.findIndex(item => item.title === children)}`}>
                                                {children}
                                            </Title>
                                        ),
                                        h3: ({children, ...props}) => (
                                            <Title level={3}
                                                   id={`heading-${tocItems.findIndex(item => item.title === children)}`}>
                                                {children}
                                            </Title>
                                        ),
                                        h4: ({children, ...props}) => (
                                            <Title level={4}
                                                   id={`heading-${tocItems.findIndex(item => item.title === children)}`}>
                                                {children}
                                            </Title>
                                        ),
                                        p: ({children}) => <Paragraph>{children}</Paragraph>,
                                        code: ({node, className, children, ...props}) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';
                                            const isInline = !className || !language;

                                            if (!isInline && language) {
                                                return (
                                                    <CodeBlock language={language}>
                                                        {String(children).replace(/\n$/, '')}
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
                                    {article.content}
                                </ReactMarkdown>
                            </div>

                            <Divider/>

                            {/* 相关文章 */}
                            <div className="article-footer">
                                <Card title="📚 相关文章" style={{marginBottom: 16}}>
                                    <ArticleList showPagination={false} pageSize={3}/>
                                </Card>
                            </div>

                            <Divider/>

                            {/* 评论区 */}
                            <CommentSection articleId={article.id}/>
                        </article>
                    </Col>

                    {/* 右侧侧边栏 */}
                    <Col xs={24} lg={8}>
                        <div className="article-sidebar">
                            <Card title="📋 目录" style={{marginBottom: 16}}>
                                {tocItems.length > 0 ? (
                                    <Anchor
                                        affix={false}
                                        items={tocItems}
                                        offsetTop={80}
                                    />
                                ) : (
                                    <p>暂无目录</p>
                                )}
                            </Card>

                            <Sidebar/>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
