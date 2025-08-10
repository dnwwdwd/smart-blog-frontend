'use client';
import React, { useState, useEffect } from 'react';
import { Card, Anchor, Typography } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import './styles.css';

const { Title } = Typography;
const { Link } = Anchor;

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  key: string;
  href: string;
  title: string;
  level: number;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  useEffect(() => {
    // 解析markdown内容中的标题
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const key = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-');
      
      items.push({
        key,
        href: `#${key}`,
        title,
        level
      });
    }

    setTocItems(items);
  }, [content]);

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <Card 
      title={
        <div className="toc-title">
          <UnorderedListOutlined />
          <span>目录</span>
        </div>
      }
      className="table-of-contents"
      size="small"
    >
      <Anchor
        className="toc-anchor"
        offsetTop={80}
        bounds={5}
        items={tocItems.map(item => ({
          key: item.key,
          href: item.href,
          title: (
            <span 
              className={`toc-item toc-level-${item.level}`}
              title={item.title}
            >
              {item.title}
            </span>
          )
        }))}
      />
    </Card>
  );
};

export default TableOfContents;