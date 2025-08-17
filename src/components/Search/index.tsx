"use client";
import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import SearchModal from "@/components/SearchModal";

interface HeroSearchProps {
  className?: string;
}

export default function SearchInput({ className }: HeroSearchProps) {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setSearchModalVisible(true);
  };

  const handleInputClick = () => {
    setSearchModalVisible(true);
  };

  return (
    <>
      <Input.Search
        size="large"
        placeholder="搜索文章、专栏、标签..."
        prefix={<SearchOutlined />}
        className={className}
        onSearch={handleSearch}
        onClick={handleInputClick}
        style={{ cursor: 'pointer' }}
      />
      
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        defaultKeyword={searchKeyword}
      />
    </>
  );
}