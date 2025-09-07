'use client';
import React from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Tag } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  EyeOutlined,
  LikeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import './styles.css';

// Mock 数据
const mockStats = {
  totalArticles: 156,
  totalViews: 12450,
  totalLikes: 3240,
  totalComments: 890,
  articlesGrowth: 12.5,
  viewsGrowth: 8.3,
  likesGrowth: -2.1,
  commentsGrowth: 15.7
};

const mockRecentArticles = [
  {
    key: '1',
    title: 'React 18 新特性详解',
    author: '张三',
    publishDate: '2025-01-15',
    views: 1250,
    status: 'published'
  },
  {
    key: '2',
    title: 'Vue 3 Composition API 实战',
    author: '李四',
    publishDate: '2025-01-14',
    views: 980,
    status: 'published'
  },
  {
    key: '3',
    title: 'TypeScript 高级类型系统',
    author: '王五',
    publishDate: '2025-01-13',
    views: 756,
    status: 'draft'
  }
];

const mockViewsData = [
  { date: '2025-01-01', views: 120 },
  { date: '2025-01-02', views: 150 },
  { date: '2025-01-03', views: 180 },
  { date: '2025-01-04', views: 200 },
  { date: '2025-01-05', views: 170 },
  { date: '2025-01-06', views: 220 },
  { date: '2025-01-07', views: 250 }
];

const mockCategoryData = [
  { category: '前端开发', count: 45 },
  { category: '后端开发', count: 32 },
  { category: '移动开发', count: 28 },
  { category: '数据科学', count: 25 },
  { category: '人工智能', count: 26 }
];

const mockTagData = [
  { tag: 'React', value: 35 },
  { tag: 'Vue', value: 28 },
  { tag: 'JavaScript', value: 42 },
  { tag: 'TypeScript', value: 25 },
  { tag: 'Node.js', value: 20 }
];

const AdminDashboard: React.FC = () => {
  const columns = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <a>{text}</a>
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => views.toLocaleString()
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      )
    }
  ];

  const lineConfig = {
    data: mockViewsData,
    xField: 'date',
    yField: 'views',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle'
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: '浏览量', value: datum.views };
      }
    }
  };

  const columnConfig = {
    data: mockCategoryData,
    xField: 'category',
    yField: 'count',
    color: '#52c41a',
    columnWidthRatio: 0.6,
    tooltip: {
      formatter: (datum: any) => {
        return { name: '文章数量', value: datum.count };
      }
    }
  };

  const pieConfig = {
    data: mockTagData,
    angleField: 'value',
    colorField: 'tag',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (datum: { tag: string; value: number }, mappingData: any) => {
        const total = mockTagData.reduce((sum, d) => sum + d.value, 0);
        const pct = total ? ((datum.value / total) * 100).toFixed(1) : '0.0';
        return `${datum.tag} ${pct}%`;
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">仪表盘</h1>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总文章数"
              value={mockStats.totalArticles}
              prefix={<FileTextOutlined />}
              suffix={
                <span className={mockStats.articlesGrowth > 0 ? 'growth-positive' : 'growth-negative'}>
                  {mockStats.articlesGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.articlesGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={mockStats.totalViews}
              prefix={<EyeOutlined />}
              suffix={
                <span className={mockStats.viewsGrowth > 0 ? 'growth-positive' : 'growth-negative'}>
                  {mockStats.viewsGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.viewsGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总点赞数"
              value={mockStats.totalLikes}
              prefix={<LikeOutlined />}
              suffix={
                <span className={mockStats.likesGrowth > 0 ? 'growth-positive' : 'growth-negative'}>
                  {mockStats.likesGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.likesGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={mockStats.totalComments}
              prefix={<UserOutlined />}
              suffix={
                <span className={mockStats.commentsGrowth > 0 ? 'growth-positive' : 'growth-negative'}>
                  {mockStats.commentsGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(mockStats.commentsGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card title="浏览量趋势" className="chart-card">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="热门标签分布" className="chart-card">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={12}>
          <Card title="分类文章统计" className="chart-card">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近文章" className="table-card">
            <Table
              columns={columns}
              dataSource={mockRecentArticles}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态 */}
      <Row gutter={[16, 16]} className="status-row">
        <Col xs={24} lg={12}>
          <Card title="系统状态" className="status-card">
            <div className="status-item">
              <span>CPU 使用率</span>
              <Progress percent={45} status="active" />
            </div>
            <div className="status-item">
              <span>内存使用率</span>
              <Progress percent={67} status="active" />
            </div>
            <div className="status-item">
              <span>磁盘使用率</span>
              <Progress percent={23} status="active" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="快速操作" className="quick-actions">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Card size="small" hoverable className="action-card">
                  <FileTextOutlined className="action-icon" />
                  <div>新建文章</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" hoverable className="action-card">
                  <UserOutlined className="action-icon" />
                  <div>用户管理</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;