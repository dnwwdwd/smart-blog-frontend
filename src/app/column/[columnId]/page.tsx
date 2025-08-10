"use server";
import React from 'react';
import {Metadata} from 'next';
import {Avatar, Col, Row, Statistic, Tag} from 'antd';
import {CalendarOutlined, EyeOutlined, FileTextOutlined, UserOutlined} from '@ant-design/icons';
import ArticleList from '@/components/ArticleList/page';
import Sidebar from '@/components/Sidebar/page';
import './styles.css';
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Image from "next/image";

// Mock data for columns
const mockColumns = [
    {
        id: 1,
        title: 'React 进阶指南',
        description: '深入学习 React 的高级特性和最佳实践，包括 Hooks、性能优化、状态管理等内容。',
        cover: 'https://picsum.photos/300/200?random=1',
        author: {
            name: '张三',
            avatar: 'https://picsum.photos/40/40?random=1'
        },
        createdAt: '2024-01-15',
        viewCount: 1250,
        articleCount: 15,
        tags: ['React', 'JavaScript', '前端开发']
    },
    {
        id: 2,
        title: 'Vue.js 实战教程',
        description: 'Vue.js 从入门到精通的完整教程，涵盖组件开发、路由管理、状态管理等核心概念。',
        cover: 'https://picsum.photos/300/200?random=2',
        author: {
            name: '李四',
            avatar: 'https://picsum.photos/40/40?random=2'
        },
        createdAt: '2024-01-10',
        viewCount: 980,
        articleCount: 12,
        tags: ['Vue.js', 'JavaScript', '前端框架']
    }
];

interface Props {
    params: Promise<{
        columnId: string;
    }>;
}

export async function generateStaticParams() {
    return mockColumns.map((column) => ({
        columnId: column.id.toString(),
    }));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {columnId} = await params;
    const column = mockColumns.find(c => c.id === parseInt(columnId));

    return {
        title: column ? `${column.title} - 汉堡博客` : '专栏详情 - 汉堡博客',
        description: column?.description || '专栏详情页面',
    };
}

export default async function ColumnDetailPage({params}: Props) {
    const {columnId} = await params;
    const column = mockColumns.find(c => c.id === parseInt(columnId));

    if (!column) {
        return (
            <div className="column-detail-container">
                <div className="column-not-found">
                    <Title level={2}>专栏不存在</Title>
                    <Paragraph>抱歉，您访问的专栏不存在或已被删除。</Paragraph>
                </div>
            </div>
        );
    }

    return (
        <div className="column-detail-container">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={18}>
                    {/* 专栏信息 */}
                    <div className="column-header">
                        <div className="column-cover">
                            <Image width={200} src={column.cover} alt={column.title}/>
                        </div>
                        <div className="column-info">
                            <Title level={1} className="column-title">{column.title}</Title>
                            <Paragraph className="column-description">{column.description}</Paragraph>

                            <div className="column-meta">
                                <div className="author-info">
                                    <Avatar src={column.author.avatar} icon={<UserOutlined/>}/>
                                    <span className="author-name">{column.author.name}</span>
                                </div>
                                <div className="column-stats">
                                    <Statistic
                                        title="文章数"
                                        value={column.articleCount}
                                        prefix={<FileTextOutlined/>}
                                        valueStyle={{fontSize: '16px'}}
                                    />
                                    <Statistic
                                        title="阅读量"
                                        value={column.viewCount}
                                        prefix={<EyeOutlined/>}
                                        valueStyle={{fontSize: '16px'}}
                                    />
                                </div>
                            </div>

                            <div className="column-tags">
                                {column.tags.map((tag, index) => (
                                    <Tag key={index} color="blue">{tag}</Tag>
                                ))}
                            </div>

                            <div className="column-date">
                                <CalendarOutlined/> 创建于 {column.createdAt}
                            </div>
                        </div>
                    </div>

                    {/* 专栏文章列表 */}
                    <div className="column-articles">
                        <Title level={3}>专栏文章</Title>
                        <ArticleList showPagination={true} pageSize={10}/>
                    </div>
                </Col>

                <Col xs={24} lg={6}>
                    <Sidebar/>
                </Col>
            </Row>
        </div>
    );
}