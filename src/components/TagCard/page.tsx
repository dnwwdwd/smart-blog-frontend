import React from 'react';
import { Card, Badge } from 'antd';
import { EyeOutlined, HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import './styles.css';

export interface Tag {
  id: number;
  name: string;
  description: string;
  color: string;
  articleCount: number;
  followCount: number;
  icon: string;
}

interface TagCardProps {
  tag: Tag;
}

export default function TagCard({ tag }: TagCardProps) {
  return (
    <Link href={`/tag/${tag.id}`} style={{ textDecoration: 'none' }}>
      <Card
        className="tag-card"
        hoverable
        styles={{ body: { padding: '20px' } }}
      >
        <div className="tag-content">
          <div className="tag-header">
            <div className="tag-icon" style={{ backgroundColor: tag.color }}>
              {tag.icon}
            </div>
            <Title level={4} className="tag-name">
              {tag.name}
            </Title>
          </div>
          
          <Paragraph className="tag-description">
            {tag.description}
          </Paragraph>
          
          <div className="tag-stats">
            <div className="stat-item">
              <EyeOutlined />
              <span>{tag.articleCount} 篇文章</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}