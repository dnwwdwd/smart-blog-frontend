"use server";
import React from "react";
import { getTagPage } from "@/api/tagController";
import TagsPageClient from "@/components/TagsPageClient";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";

const TagsPage = async () => {
  const initialResponse = await getTagPage({
    current: 1,
    pageSize: 20,
  }) as any;

  const initialData = initialResponse?.data?.records || [];
  const initialTotal = initialResponse?.data?.total || 0;

  return (
    <div className="tags-page">
      <div className="tags-container">
        <div className="tags-header mb-6">
          <h1>🏷️ 标签列表</h1>
        </div>
        <div className="tags-page-layout">
          <TagsPageClient
            initialData={initialData}
            initialTotal={initialTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
