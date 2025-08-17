import React from "react";
import Link from "next/link";
import "./styles.css";

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
  tags?: Tag[];
  tag?: API.TagVo;
}

export default function TagCard({ tags, tag }: TagCardProps) {
  // 如果传入单个tag，则渲染单个标签卡片
  if (tag) {
    return (
      <Link href={`/tag/${tag.id}`} style={{ textDecoration: "none" }}>
        <div className="tag-card">
          <span className="tag-hash">#</span>
          <span className="tag-name">{tag.name}</span>
          <span className="tag-count">{tag.articleCount || 0}</span>
        </div>
      </Link>
    );
  }

  // 如果传入tags数组，则渲染多个标签卡片
  return (
    <div className="tag-container">
      {tags?.map((tagItem) => (
        <Link key={tagItem.id} href={`/tag/${tagItem.id}`} style={{ textDecoration: "none" }}>
          <div className="tag-card">
            <span className="tag-hash">#</span>
            <span className="tag-name">{tagItem.name}</span>
            <span className="tag-count">{tagItem.articleCount}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
