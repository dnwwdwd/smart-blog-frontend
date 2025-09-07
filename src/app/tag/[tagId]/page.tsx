"use server";
import React from 'react';
import {Metadata} from 'next';
import {Col, Row, Statistic} from 'antd';
import {FileTextOutlined, TagOutlined} from '@ant-design/icons';
import TagArticleListClient from '@/components/TagArticleListClient';
import Sidebar from '@/components/Sidebar/page';
import './styles.css';
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

async function getTagInfo(tagId: string) {
  return {
    id: parseInt(tagId),
    name: `标签 ${tagId}`,
    description: `这是标签 ${tagId} 的描述信息`,
    articleCount: 0,
    followCount: 0,
    color: '#1890ff'
  };
}

interface Props {
    params: Promise<{
        tagId: string;
    }>;
}

export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const {tagId} = await params;
    const tag = await getTagInfo(tagId);

    return {
        title: `${tag.name} - 汉堡博客`,
        description: tag.description,
    };
}

export default async function TagDetailPage({params}: Props) {
    const {tagId} = await params;
    const tag = await getTagInfo(tagId);

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
                        <TagArticleListClient tagId={tagId} />
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <Sidebar/>
                </Col>
            </Row>
        </div>
    );
}