import React from 'react';
import { Card } from 'antd';
import { CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import './styles.css';

export interface Column {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  createDate: string;
  articleCount: number;
  viewCount: number;
  tags: string[];
}

interface ColumnCardProps {
  column: Column;
}

export default function ColumnCard({ column }: ColumnCardProps) {
  return (
    <Link href={`/column/${column.id}`} style={{ textDecoration: 'none' }}>
      <Card
        className="column-card"
        hoverable
        cover={
          <div className="column-cover">
            <Image
              src={column.coverImage}
              alt={column.title}
              width={400}
              height={250}
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          </div>
        }
      >
        <div className="column-content">
          <Title level={4} className="column-title">
            {column.title}
          </Title>
          
          <Paragraph className="column-description">
            {column.description}
          </Paragraph>
          
          <div className="column-meta">
            <div className="meta-item">
              <UserOutlined />
              <span>{column.author}</span>
            </div>
            <div className="meta-item">
              <CalendarOutlined />
              <span>{column.createDate}</span>
            </div>
            <div className="meta-item">
              <span>{column.articleCount} 篇文章</span>
            </div>
            <div className="meta-item">
              <EyeOutlined />
              <span>{column.viewCount}</span>
            </div>
          </div>
          
          <div className="column-tags">
            {column.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}