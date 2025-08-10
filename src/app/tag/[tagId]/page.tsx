"use server";
import React from 'react';
import {Metadata} from 'next';
import {Col, Row, Statistic} from 'antd';
import {FileTextOutlined, TagOutlined} from '@ant-design/icons';
import ArticleList from '@/components/ArticleList/page';
import Sidebar from '@/components/Sidebar/page';
import './styles.css';
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

// Mock data for tags
const mockTags = [
    {
        id: 1,
        name: 'React',
        description: 'React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发和维护。',
        articleCount: 156,
        followCount: 1240,
        color: '#61dafb'
    },
    {
        id: 2,
        name: 'Vue.js',
        description: 'Vue.js 是一套用于构建用户界面的渐进式框架，易学易用，性能出色。',
        articleCount: 98,
        followCount: 890,
        color: '#4fc08d'
    },
    {
        id: 3,
        name: 'JavaScript',
        description: 'JavaScript 是一种高级的、解释执行的编程语言，是 Web 开发的核心技术之一。',
        articleCount: 234,
        followCount: 2100,
        color: '#f7df1e'
    }
];

interface Props {
    params: Promise<{
        tagId: string;
    }>;
}

export async function generateStaticParams() {
    return mockTags.map((tag) => ({
        tagId: tag.id.toString(),
    }));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {tagId} = await params;
    const tag = mockTags.find(t => t.id === parseInt(tagId));

    return {
        title: tag ? `${tag.name} - 汉堡博客` : '标签详情 - 汉堡博客',
        description: tag?.description || '标签详情页面',
    };
}

export default async function TagDetailPage({params}: Props) {
    const {tagId} = await params;
    const tag = mockTags.find(t => t.id === parseInt(tagId));

    if (!tag) {
        return (
            <div className="tag-detail-container">
                <div className="tag-not-found">
                    <Title level={2}>标签不存在</Title>
                    <Paragraph>抱歉，您访问的标签不存在或已被删除。</Paragraph>
                </div>
            </div>
        );
    }

    return (
        <div className="tag-detail-container">
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* 标签信息 */}
                    <div className="tag-header">
                        <div className="tag-info">
                            <div className="tag-icon" style={{backgroundColor: tag.color}}>
                                <TagOutlined/>
                            </div>
                            <div className="tag-content">
                                <Title level={1} className="tag-title">{tag.name}</Title>
                                <Paragraph className="tag-description">{tag.description}</Paragraph>

                                <div className="tag-stats">
                                    <Statistic
                                        title="文章数"
                                        value={tag.articleCount}
                                        prefix={<FileTextOutlined/>}
                                        valueStyle={{fontSize: '18px', color: '#1890ff'}}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* 相关文章列表 */}
                    <div className="tag-articles">
                        <Title level={3}>相关文章</Title>
                        <ArticleList showPagination={true} pageSize={10}/>
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <Sidebar/>
                </Col>
            </Row>
        </div>
    );
}