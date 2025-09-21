"use client";

import React, { useEffect, useState } from "react";
import { Avatar, Empty, Input, List, Modal, Spin, Tabs, Tag } from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  SearchOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import LoadingLink from '@/components/LoadingLink';
import { getArticlePage } from "@/api/articleController";
import { getColumnPage } from "@/api/columnController";
import { getTagPage } from "@/api/tagController";
import "./styles.css";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  defaultKeyword?: string;
}

interface SearchResult {
  articles: API.ArticleVo[];
  columns: API.ColumnVo[];
  tags: API.TagVo[];
  loading: {
    articles: boolean;
    columns: boolean;
    tags: boolean;
  };
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  defaultKeyword = "",
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [activeTab, setActiveTab] = useState("articles");
  const [searchResult, setSearchResult] = useState<SearchResult>({
    articles: [],
    columns: [],
    tags: [],
    loading: {
      articles: false,
      columns: false,
      tags: false,
    },
  });

  // 搜索文章
  const searchArticles = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setSearchResult((prev) => ({ ...prev, articles: [] }));
      return;
    }

    setSearchResult((prev) => ({
      ...prev,
      loading: { ...prev.loading, articles: true },
    }));

    try {
      const response = (await getArticlePage({
        current: 1,
        pageSize: 10,
        title: searchKeyword,
      })) as any;

      if (response?.code === 0 && response?.data) {
        setSearchResult((prev) => ({
          ...prev,
          articles: response?.data?.records || [],
        }));
      }
    } catch (error) {
      console.error("搜索文章失败:", error);
    } finally {
      setSearchResult((prev) => ({
        ...prev,
        loading: { ...prev.loading, articles: false },
      }));
    }
  };

  // 搜索专栏
  const searchColumns = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setSearchResult((prev) => ({ ...prev, columns: [] }));
      return;
    }

    setSearchResult((prev) => ({
      ...prev,
      loading: { ...prev.loading, columns: true },
    }));

    try {
      const response = (await getColumnPage({
        current: 1,
        pageSize: 10,
        columnName: searchKeyword,
      })) as any;

      if (response?.code === 0 && response?.data) {
        setSearchResult((prev) => ({
          ...prev,
          columns: response.data?.records || [],
        }));
      }
    } catch (error) {
      console.error("搜索专栏失败:", error);
    } finally {
      setSearchResult((prev) => ({
        ...prev,
        loading: { ...prev.loading, columns: false },
      }));
    }
  };

  // 搜索标签
  const searchTags = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setSearchResult((prev) => ({ ...prev, tags: [] }));
      return;
    }

    setSearchResult((prev) => ({
      ...prev,
      loading: { ...prev.loading, tags: true },
    }));

    try {
      const response = (await getTagPage({
        current: 1,
        pageSize: 10,
        tagName: searchKeyword,
      })) as any;

      if (response?.code === 0 && response?.data) {
        setSearchResult((prev) => ({
          ...prev,
          tags: response?.data?.records || [],
        }));
      }
    } catch (error) {
      console.error("搜索标签失败:", error);
    } finally {
      setSearchResult((prev) => ({
        ...prev,
        loading: { ...prev.loading, tags: false },
      }));
    }
  };

  // 执行搜索 - 根据当前激活的tab执行对应搜索
  const handleSearch = (searchKeyword: string) => {
    switch (activeTab) {
      case "articles":
        searchArticles(searchKeyword);
        break;
      case "columns":
        searchColumns(searchKeyword);
        break;
      case "tags":
        searchTags(searchKeyword);
        break;
      default:
        searchArticles(searchKeyword);
        break;
    }
  };

  // 切换tab时执行搜索
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (keyword.trim()) {
      switch (key) {
        case "articles":
          if (searchResult.articles.length === 0) {
            searchArticles(keyword);
          }
          break;
        case "columns":
          if (searchResult.columns.length === 0) {
            searchColumns(keyword);
          }
          break;
        case "tags":
          if (searchResult.tags.length === 0) {
            searchTags(keyword);
          }
          break;
      }
    }
  };

  // 监听关键词变化
  useEffect(() => {
    if (keyword.trim()) {
      const timer = setTimeout(() => {
        handleSearch(keyword);
      }, 300); // 防抖

      return () => clearTimeout(timer);
    } else {
      // 清空搜索结果
      setSearchResult({
        articles: [],
        columns: [],
        tags: [],
        loading: {
          articles: false,
          columns: false,
          tags: false,
        },
      });
    }
  }, [keyword]);

  // 监听默认关键词变化
  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  // Tab配置
  const tabItems = [
    {
      key: "articles",
      label: (
        <span>
          <FileTextOutlined />
          文章 ({searchResult.articles.length})
        </span>
      ),
      children: (
        <div className="search-tab-content">
          <Spin spinning={searchResult.loading.articles}>
            {searchResult.articles.length > 0 ? (
              <List
                bordered={true}
                dataSource={searchResult.articles}
                renderItem={(article) => (
                  <List.Item className="search-item">
                    <LoadingLink href={`/article/${article.id}`} onClick={onClose}>
                      <div className="search-item-content">
                        <div className="search-item-header">
                          <h4 className="search-item-title">{article.title}</h4>
                          <span className="search-item-views">
                            {article.views} 阅读
                          </span>
                        </div>
                        <p className="search-item-excerpt">{article.excerpt}</p>
                        <div className="search-item-tags">
                          {article.tags?.slice(0, 3).map((tag, index) => (
                            <Tag key={index}>{tag}</Tag>
                          ))}
                        </div>
                      </div>
                    </LoadingLink>
                  </List.Item>
                )}
              />
            ) : (
              !searchResult.loading.articles &&
              keyword.trim() && <Empty description="暂无相关文章" />
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: "columns",
      label: (
        <span>
          <BookOutlined />
          专栏 ({searchResult.columns.length})
        </span>
      ),
      children: (
        <div className="search-tab-content">
          <Spin spinning={searchResult.loading.columns}>
            {searchResult.columns.length > 0 ? (
              <List
                bordered={true}
                dataSource={searchResult.columns}
                renderItem={(column) => (
                  <List.Item className="search-item">
                    <LoadingLink href={`/column/${column.id}`} onClick={onClose}>
                      <div className="search-item-content">
                        <div className="search-item-header">
                          <Avatar
                            src={column.coverImage}
                            size={40}
                            className="search-item-avatar"
                          />
                          <div className="search-item-info">
                            <h4 className="search-item-title">{column.name}</h4>
                            <span className="search-item-count">
                              {column.articleCount} 篇文章
                            </span>
                          </div>
                        </div>
                        <p className="search-item-excerpt">
                          {column.description}
                        </p>
                      </div>
                    </LoadingLink>
                  </List.Item>
                )}
              />
            ) : (
              !searchResult.loading.columns &&
              keyword.trim() && <Empty description="暂无相关专栏" />
            )}
          </Spin>
        </div>
      ),
    },
    {
      key: "tags",
      label: (
        <span>
          <TagsOutlined />
          标签 ({searchResult.tags.length})
        </span>
      ),
      children: (
        <div className="search-tab-content">
          <Spin spinning={searchResult.loading.tags}>
            {searchResult.tags.length > 0 ? (
              <List
                bordered={true}
                dataSource={searchResult.tags}
                renderItem={(tag) => (
                  <List.Item className="search-item">
                    <LoadingLink href={`/tag/${tag.id}`} onClick={onClose}>
                      <div className="search-item-content">
                        <div className="search-item-header">
                          <Tag color={tag.color} className="search-tag-item">
                            {tag.name}
                          </Tag>
                          <span className="search-item-count">
                            {tag.articleCount} 篇文章
                          </span>
                        </div>
                        <p className="search-item-excerpt">{tag.description}</p>
                      </div>
                    </LoadingLink>
                  </List.Item>
                )}
              />
            ) : (
              !searchResult.loading.tags &&
              keyword.trim() && <Empty description="暂无相关标签" />
            )}
          </Spin>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="搜索"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="search-modal"
      destroyOnHidden
    >
      <div className="search-modal-content">
        <Input
          size="large"
          placeholder="搜索文章、专栏、标签..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
        />

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="search-tabs"
        />
      </div>
    </Modal>
  );
};

export default SearchModal;
