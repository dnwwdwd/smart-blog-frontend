import React from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import './styles.css';

const { Title, Text, Paragraph } = Typography;

interface RelatedArticlesProps {
  currentArticleId: number;
  tags: string[];
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  views: number;
  tags: string[];
  cover?: string;
  category: string;
}

// Mock 文章数据
const allArticles: Article[] = [
  {
    id: 1,
    title: '如何制作加载动画图？在线生成炫酷loading图支持SVG、APNG、GIF',
    excerpt: '本文介绍如何制作各种炫酷的加载动画，支持多种格式输出，包括SVG、APNG、GIF等。',
    date: '2025-01-01',
    views: 1234,
    tags: ['前端', '动画', 'SVG'],
    category: '加载动画'
  },
  {
    id: 2,
    title: '洪哥闪回来了！论坛快捷回复，自动填充随机短语，测览器插件',
    excerpt: '一个实用的浏览器插件，帮助用户快速回复论坛内容，提高交流效率。',
    date: '2024-12-28',
    views: 2156,
    tags: ['插件', '效率工具'],
    category: '浏览器插件'
  },
  {
    id: 3,
    title: '在Mac上如何测试手机与服务器之间的带宽？使用iperf3测试本地与服务器的连接情况',
    excerpt: '详细介绍如何在Mac系统上使用iperf3工具测试网络带宽和连接质量。',
    date: '2024-12-25',
    views: 1876,
    tags: ['Mac', '网络', 'iperf3'],
    category: '网络测试'
  },
  {
    id: 4,
    title: 'Sketch2025上手：迎接画框时代，对开Figma的一大步了，画框快速入门1课程',
    excerpt: 'Sketch 2025版本的新功能介绍，重点讲解画框功能的使用方法和技巧。',
    date: '2024-12-22',
    views: 3421,
    tags: ['Sketch', '设计', '教程'],
    category: '设计工具'
  },
  {
    id: 5,
    title: 'iOS26的设计规范模板下载：更大的按钮和间距，全新设计的组件',
    excerpt: '最新的iOS 26设计规范模板，包含全新的组件设计和交互规范。',
    date: '2024-12-20',
    views: 2890,
    tags: ['iOS', '设计规范', '模板'],
    category: '设计资源'
  },
  {
    id: 6,
    title: '如何自建STUN服务器？使用Docker快速搭建STUN服务器方法',
    excerpt: '详细介绍如何使用Docker快速搭建STUN服务器，解决NAT穿透问题。',
    date: '2024-12-18',
    views: 1654,
    tags: ['Docker', 'STUN', '服务器'],
    category: '服务器运维'
  },
  {
    id: 7,
    title: 'React Hooks 最佳实践指南',
    excerpt: '深入解析React Hooks的使用技巧和最佳实践，提升开发效率。',
    date: '2024-12-15',
    views: 2345,
    tags: ['React', '前端', 'Hooks'],
    category: '前端开发'
  },
  {
    id: 8,
    title: 'CSS Grid 布局完全指南',
    excerpt: '全面介绍CSS Grid布局的使用方法，从基础到高级应用。',
    date: '2024-12-12',
    views: 1987,
    tags: ['CSS', '前端', '布局'],
    category: '前端开发'
  },
  {
    id: 9,
    title: 'TypeScript 进阶技巧分享',
    excerpt: 'TypeScript高级特性和实用技巧，让你的代码更加健壮。',
    date: '2024-12-10',
    views: 2678,
    tags: ['TypeScript', '前端', '编程'],
    category: '编程语言'
  }
];

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentArticleId, tags }) => {
  // 根据标签匹配相关文章
  const getRelatedArticles = () => {
    return allArticles
      .filter(article => {
        // 排除当前文章
        if (article.id === currentArticleId) return false;
        
        // 检查是否有共同标签
        return article.tags.some(tag => tags.includes(tag));
      })
      .sort((a, b) => {
        // 按共同标签数量排序
        const aCommonTags = a.tags.filter(tag => tags.includes(tag)).length;
        const bCommonTags = b.tags.filter(tag => tags.includes(tag)).length;
        return bCommonTags - aCommonTags;
      })
      .slice(0, 6); // 最多显示6篇相关文章
  };

  const relatedArticles = getRelatedArticles();

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="related-articles">
      <Title level={3} style={{ marginBottom: 24 }}>
        相关文章
      </Title>
      
      <Row gutter={[16, 16]}>
        {relatedArticles.map((article) => (
          <Col xs={24} sm={12} lg={8} key={article.id}>
            <Link href={`/article/${article.id}`} style={{ textDecoration: 'none' }}>
              <Card
                hoverable
                className="related-article-card"
                cover={
                  article.cover ? (
                    <div className="article-cover">
                      <img
                        alt={article.title}
                        src={article.cover}
                        style={{
                          width: '100%',
                          height: 160,
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="article-cover-placeholder">
                      <div className="cover-text">{article.category}</div>
                    </div>
                  )
                }
              >
                <div className="article-content">
                  <Title level={5} className="article-title">
                    {article.title}
                  </Title>
                  
                  <Paragraph
                    className="article-excerpt"
                    ellipsis={{ rows: 2 }}
                  >
                    {article.excerpt}
                  </Paragraph>
                  
                  <div className="article-tags">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <Tag
                        key={index}
                        color={tags.includes(tag) ? 'blue' : 'default'}
                        className="article-tag"
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  
                  <div className="article-meta">
                    <Space size={16}>
                      <span className="meta-item">
                        <CalendarOutlined className="meta-icon" />
                        <Text type="secondary" className="meta-text">
                          {article.date}
                        </Text>
                      </span>
                      <span className="meta-item">
                        <EyeOutlined className="meta-icon" />
                        <Text type="secondary" className="meta-text">
                          {article.views.toLocaleString()}
                        </Text>
                      </span>
                    </Space>
                  </div>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
      
      <div className="view-more">
        <Link href="/articles">
          <Text type="secondary">查看更多文章 →</Text>
        </Link>
      </div>
    </div>
  );
};

export default RelatedArticles;