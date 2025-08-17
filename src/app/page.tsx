import React from "react";
import { Button, Card, Col, Row, Space, Statistic } from "antd";
import {
  BookOutlined,
  EyeOutlined,
  FileTextOutlined,
  FireOutlined,
  RightOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { getArticlePage } from "@/api/articleController";
import { getColumnPage } from "@/api/columnController";
import { getTagPage } from "@/api/tagController";
import RecentArticles from "@/components/RecentArticles";
import ColumnCard from "@/components/ColumnCard/page";
import TagCard from "@/components/TagCard/page";
import Sidebar from "@/components/Sidebar/page";
import SearchInput from "../components/Search";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import "@ant-design/v5-patch-for-react-19";

export default async function HomePage() {
  // 获取首页数据
  let recentArticles = [];
  let featuredColumns = [];
  let popularTags = [];
  let stats = {
    totalArticles: 0,
    totalColumns: 0,
    totalTags: 0,
    totalViews: 0,
  };

  try {
    // 获取最新文章
    const articlesResponse = (await getArticlePage({
      current: 1,
      pageSize: 6,
    })) as any;
    recentArticles = articlesResponse?.data?.records || [];
    stats.totalArticles = articlesResponse?.data?.total || 0;

    // 获取热门专栏
    const columnsResponse = (await getColumnPage({
      current: 1,
      pageSize: 4,
    })) as any;
    featuredColumns = columnsResponse?.data?.records || [];
    stats.totalColumns = columnsResponse?.data?.total || 0;

    // 获取热门标签
    const tagsResponse = (await getTagPage({
      current: 1,
      pageSize: 12,
    })) as any;
    popularTags = tagsResponse?.data?.records || [];
    stats.totalTags = tagsResponse?.data?.total || 0;

    // 计算总浏览量（模拟数据）
    stats.totalViews = recentArticles.reduce(
      (sum: number, article: any) => sum + (article.views || 0),
      0
    );
  } catch (error) {
    console.error("获取首页数据失败:", error);
  }

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero 区域 */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <Title level={1} className="hero-title">
                欢迎来到智能博客 🚀
              </Title>
              <Paragraph className="hero-description">
                探索技术世界，分享知识与见解。在这里发现优质内容，与志同道合的朋友一起成长。
              </Paragraph>
            </div>

            {/* 搜索区域 */}
            <div className="hero-search">
              <SearchInput className="search-input" />
            </div>

            {/* 快速导航 */}
            <div className="quick-nav">
              <Space size="middle">
                <Link href="/articles">
                  <Button type="primary" icon={<FileTextOutlined />}>
                    浏览文章
                  </Button>
                </Link>
                <Link href="/columns">
                  <Button icon={<BookOutlined />}>专栏列表</Button>
                </Link>
                <Link href="/tags">
                  <Button icon={<TagsOutlined />}>标签云</Button>
                </Link>
              </Space>
            </div>
          </div>
        </section>

        {/* 统计信息 */}
        <section className="stats-section">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="文章总数"
                  value={stats.totalArticles}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="专栏数量"
                  value={stats.totalColumns}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="标签数量"
                  value={stats.totalTags}
                  prefix={<TagsOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card className="stat-card">
                <Statistic
                  title="总浏览量"
                  value={stats.totalViews}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Card>
            </Col>
          </Row>
        </section>

        {/* 主要内容区域 */}
        <div className="main-layout">
          <div className="content-area">
            {/* 最新文章 */}
            <RecentArticles
              articles={recentArticles}
              showMore={true}
              maxCount={6}
            />

            {/* 热门专栏 */}
            {featuredColumns.length > 0 && (
              <section className="columns-section">
                <div className="section-header">
                  <Title level={2} className="section-title">
                    <FireOutlined /> 热门专栏
                  </Title>
                  <Link href="/columns">
                    <Button type="link" icon={<RightOutlined />}>
                      查看更多
                    </Button>
                  </Link>
                </div>
                <Row gutter={[24, 24]}>
                  {featuredColumns.slice(0, 3).map((column: any) => (
                    <Col xs={24} sm={12} lg={8} key={column.id}>
                      <ColumnCard column={column} />
                    </Col>
                  ))}
                </Row>
              </section>
            )}

            {/* 热门标签 */}
            {popularTags.length > 0 && (
              <section className="tags-section">
                <div className="section-header">
                  <Title level={2} className="section-title">
                    <TagsOutlined /> 热门标签
                  </Title>
                  <Link href="/tags">
                    <Button type="link" icon={<RightOutlined />}>
                      查看更多
                    </Button>
                  </Link>
                </div>
                <div className="tags-cloud">
                  {popularTags.slice(0, 12).map((tag: any) => (
                    <TagCard key={tag.id} tag={tag} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="sidebar-area">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
