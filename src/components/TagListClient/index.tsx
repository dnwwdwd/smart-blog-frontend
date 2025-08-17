"use client";

import React from "react";
import TagCard from "@/components/TagCard/page";
import { useTagsData } from "@/components/TagsPageClient";

const TagListClient: React.FC = () => {
  const { data: tags, loading } = useTagsData();

  return (
    <div className="align-center">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} />
      ))}
    </div>
  );
};

export default TagListClient;
