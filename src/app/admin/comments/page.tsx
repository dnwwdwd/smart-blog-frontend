"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import "@ant-design/v5-patch-for-react-19";
import { getCommentPage, deleteComment } from "@/api/commentController";
import { formatDate, formatDateTime } from "@/utils";
import "./styles.css";
import Link from "next/link";

interface CommentItem {
  key?: string;
  id?: number;
  articleId?: number;
  articleTitle?: string;
  parentId?: number;
  nickname?: string;
  userEmail?: string;
  userWebsite?: string;
  userAvatar?: string;
  content?: string;
  ipAddress?: string;
  userAgent?: string;
  createTime?: string;
  userId?: number;
}

const CommentManagement: React.FC = () => {
  const [data, setData] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res: any = await getCommentPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchKeyword: searchText || undefined,
      });
      if (res?.code === 0) {
        const list: CommentItem[] = (res.data?.records || []).map(
          (it: any) => ({
            ...it,
            key: String(it.id ?? Math.random()),
          })
        );
        setData(list);
        setPagination((prev) => ({ ...prev, total: res.data?.total || 0 }));
      } else {
        message.error(res?.message || "获取评论数据失败");
      }
    } catch (e) {
      message.error("获取评论数据失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (pagination.current === 1) fetchComments();
    else setPagination((p) => ({ ...p, current: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      const res: any = await deleteComment({ id });
      if (res?.code === 0) {
        message.success("删除成功");
        fetchComments();
      } else {
        message.error(res?.message || "删除失败");
      }
    } catch (e) {
      message.error("删除失败，请重试");
    }
  };

  const columns: ColumnsType<CommentItem> = [
    {
      title: "所属文章",
      dataIndex: "articleTitle",
      ellipsis: true,
      render: (text, record) =>
        text ? (
          <Tooltip title={record.articleTitle}>
            <Link
              href={`/article/${record.articleId}`}
              className="article-title"
            >
              {text}
            </Link>
          </Tooltip>
        ) : (
          <Tag color="default">无</Tag>
        ),
    },
    {
      title: "昵称/邮箱",
      dataIndex: "nickname",
      ellipsis: true,
      render: (_, record) => (
        <div className="user-cell">
          <div className="nickname">{record.nickname || "匿名"}</div>
          {record.userEmail && <div className="email">{record.userEmail}</div>}
        </div>
      ),
    },
    {
      title: "内容",
      dataIndex: "content",
      ellipsis: true,
      render: (text) => <span className="comment-content">{text}</span>,
    },
    {
      title: "时间",
      dataIndex: "createTime",
      width: 180,
      render: (t) => (t ? formatDateTime(t) : "-"),
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确认删除该评论？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <Card className="admin-card" variant={false}>
        <div className="toolbar">
          <Input
            allowClear
            placeholder="搜索昵称 / 邮箱 / 内容"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, current: page, pageSize }),
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default CommentManagement;
