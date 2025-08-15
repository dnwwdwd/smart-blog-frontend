"use server";
import React from "react";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Sidebar from "@/components/Sidebar/page";
import TagCard, { Tag } from "@/components/TagCard/page";
import "./styles.css";
import { getTagPage } from "@/api/tagController";

export default async function TagsPage() {
  let tags = [];

  const res = await getTagPage({
    current: 1,
    pageSize: -1,
  });
  tags = res.data.records ?? [];

  return (
    <div className="tags-page">
      <div className="container">
        <div className="tags-header">
          <Title level={2}>🏷️ 标签列表</Title>
        </div>

        <div className="page-layout">
          {/* 主内容区 */}
          <div className="main-content">
            <div className="tags-grid">
              <TagCard tags={tags} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}