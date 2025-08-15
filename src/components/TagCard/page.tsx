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
  tags: Tag[];
}

export default function TagCard({ tags }: TagCardProps) {
  return (
    <div className="tag-container">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tag/${tag.id}`} style={{ textDecoration: "none" }}>
          <div className="tag-card">
            <span className="tag-hash">#</span>
            <span className="tag-name">{tag.name}</span>
            <span className="tag-count">{tag.articleCount}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
