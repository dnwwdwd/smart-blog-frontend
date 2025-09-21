"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Empty, Skeleton } from "antd";
import {
  TagsOutlined,
  FileTextOutlined,
  CommentOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Pie } from "@ant-design/plots";
import { getArticlePage } from "@/api/articleController";
import { getTagPage } from "@/api/tagController";
import { getCommentPage } from "@/api/commentController";
import { getFriendLinkPage } from "@/api/friendLinkController";
import dayjs from "dayjs";
import "@/app/admin/styles.css";

interface ArticleRow {
  key: string;
  title: string;
  publishDate?: string;
  views?: number;
  status?: number;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [articleTotal, setArticleTotal] = useState(0);
  const [tagTotal, setTagTotal] = useState(0);
  const [commentTotal, setCommentTotal] = useState(0);
  const [friendLinkTotal, setFriendLinkTotal] = useState(0);
  const [tagDist, setTagDist] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // 文章列表（最近）
        const articleRes: any = await getArticlePage({ current: 1, pageSize: 8, sortField: "publishedTime" });
        const articlePage = articleRes?.data?.data ?? articleRes?.data;
        const articleRecords: API.ArticleVo[] = articlePage?.records ?? [];
        if (!ignore) {
          setArticles(
            (articleRecords || []).map((a) => ({
              key: String(a.id ?? Math.random()),
              title: a.title || "-",
              publishDate: a.publishedTime || a.createTime,
              views: a.views,
              status: a.status,
            }))
          );
          setArticleTotal(Number(articlePage?.total || 0));
        }

        // 标签数据（用于饼图）
        const tagRes: any = await getTagPage({ current: 1, pageSize: 100 });
        const tagPage = tagRes?.data?.data ?? tagRes?.data;
        const tagRecords: API.TagVo[] = tagPage?.records ?? [];
        if (!ignore) {
          setTagTotal(Number(tagPage?.total || tagRecords?.length || 0));
          setTagDist(
            (tagRecords || [])
              .map((t) => ({ name: t.name || "未命名", value: Number(t.articleCount || 0) }))
              .filter((d) => d.value > 0)
          );
        }

        // 评论总数
        const commentRes: any = await getCommentPage({ current: 1, pageSize: 1 });
        const commentPage = commentRes?.data?.data ?? commentRes?.data;
        if (!ignore) setCommentTotal(Number(commentPage?.total || 0));

        // 友链总数
        const friendRes: any = await getFriendLinkPage({ current: 1, pageSize: 1 });
        const friendPage = friendRes?.data?.data ?? friendRes?.data;
        if (!ignore) setFriendLinkTotal(Number(friendPage?.total || 0));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const columns = [
    { title: "文章标题", dataIndex: "title", key: "title", render: (text: string) => <a>{text}</a> },
    { title: "发布日期", dataIndex: "publishDate", key: "publishDate", render: (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD HH:mm") : "-") },
    { title: "浏览量", dataIndex: "views", key: "views", render: (v?: number) => (v ?? 0).toLocaleString() },
    { title: "状态", dataIndex: "status", key: "status", render: (s?: number) => s === 1 ? <Tag color="green">已发布</Tag> : s === 2 ? <Tag color="gold">已归档</Tag> : <Tag>草稿</Tag> },
  ];

  const pieConfig = useMemo(() => ({
    data: tagDist.length > 0 ? tagDist : [{ name: "暂无数据", value: 1 }],
    angleField: "value",
    colorField: "name",
    radius: 0.8,
    label: { type: "outer" },
    interactions: [{ type: "element-active" }],
  }), [tagDist]);

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">仪表盘</h1>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="文章总数" value={articleTotal} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="标签数" value={tagTotal} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="评论总数" value={commentTotal} prefix={<CommentOutlined />} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Statistic title="友链数" value={friendLinkTotal} prefix={<LinkOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={10}>
          <Card title="热门标签分布" className="chart-card">
            {loading ? <Skeleton active /> : <Pie {...pieConfig} />}
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="最近文章" className="table-card">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : articles.length > 0 ? (
              <Table columns={columns} dataSource={articles} size="middle" pagination={{ pageSize: 8 }} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无文章" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;