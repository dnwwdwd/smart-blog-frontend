import React from "react";
import { Card } from "antd";
import Link from "next/link";
import { getTagPage } from "@/api/tagController";
import TagCard from "@/components/TagCard/page";
import "./styles.css";

const MAX_TAGS = 20;

const AllTagsSidebar = async () => {
  let tags: API.TagVo[] = [];

  try {
    const res = (await getTagPage({ current: 1, pageSize: MAX_TAGS, sortField: "articleCount" })) as any;
    const records: API.TagVo[] = res?.data?.records || [];
    tags = records
      .filter((tag) => tag.name)
      .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
      .slice(0, MAX_TAGS);
  } catch (error) {
    console.error("获取标签列表失败", error);
  }

  return (
    <Card
      title={<span className="tags-card-title">🏷 全部标签</span>}
      extra={(
        <Link href="/tags" prefetch={false} className="tags-card-more">
          查看全部
        </Link>
      )}
      className="sidebar-tags-card"
    >
      {tags.length === 0 ? (
        <div className="tags-empty">暂无标签</div>
      ) : (
        <div className="tag-container tag-container--sidebar">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default AllTagsSidebar;
