"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Table, Tag, Empty, Skeleton } from "antd";
import {
  TagsOutlined,
  FileTextOutlined,
  CommentOutlined,
  LinkOutlined,
  HeartOutlined,
  FundOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Pie, Column, Heatmap } from "@ant-design/plots";
import { getArticlePage } from "@/api/articleController";
import { getTagPage } from "@/api/tagController";
import { getCommentPage } from "@/api/commentController";
import { getFriendLinkPage } from "@/api/friendLinkController";
import { getColumnPage } from "@/api/columnController";
import { getRewardMessagePage } from "@/api/rewardController";
import dayjs from "dayjs";
import "@/app/admin/styles.css";
import type { ColumnsType } from "antd/es/table";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

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
  const [columnTotal, setColumnTotal] = useState(0);
  const [tagDist, setTagDist] = useState<{ name: string; value: number }[]>([]);
  const [rewardStats, setRewardStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    amount: 0,
  });
  const [recentRewards, setRecentRewards] = useState<API.RewardMessage[]>([]);
  const [articleTrend, setArticleTrend] = useState<{ month: string; count: number }[]>([]);
  const [viewsTotal, setViewsTotal] = useState(0);
  const [articleCalendarData, setArticleCalendarData] = useState<Array<{ week: number; day: number; date: string; count: number }>>([]);

  const statsCards = useMemo<
    {
      key: string;
      title: string;
      value: number;
      icon: React.ReactNode;
      formatter?: (val: number) => string;
    }[]
 >(() => [
    {
      key: "articles",
      title: "文章总数",
      value: articleTotal,
      icon: <FileTextOutlined />,
    },
    {
      key: "views",
      title: "累计浏览",
      value: viewsTotal,
      icon: <EyeOutlined />,
    },
    {
      key: "tags",
      title: "标签数",
      value: tagTotal,
      icon: <TagsOutlined />,
    },
    {
      key: "columns",
      title: "专栏数",
      value: columnTotal,
      icon: <LinkOutlined rotate={45} />,
    },
    {
      key: "comments",
      title: "评论总数",
      value: commentTotal,
      icon: <CommentOutlined />,
    },
    {
      key: "friendLinks",
      title: "友链数",
      value: friendLinkTotal,
      icon: <LinkOutlined />,
    },
    {
      key: "rewards",
      title: "打赏留言",
      value: rewardStats.total,
      icon: <HeartOutlined />,
    },
    {
      key: "rewardAmount",
      title: "累计打赏金额",
      value: rewardStats.amount,
      icon: <FundOutlined />,
      formatter: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
  ], [
    articleTotal,
    viewsTotal,
    tagTotal,
    columnTotal,
    commentTotal,
    friendLinkTotal,
    rewardStats.total,
    rewardStats.amount,
  ]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        // 文章列表（最近）
        const articleRes: any = await getArticlePage({ current: 1, pageSize: 50, sortField: "publishedTime" });
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
          const views = (articleRecords || []).reduce((acc, item) => acc + Number(item.views || 0), 0);
          setViewsTotal(views);
          const trendMap = new Map<string, number>();
          (articleRecords || []).forEach((article) => {
            if (!article.publishedTime && !article.createTime) return;
            const month = dayjs(article.publishedTime || article.createTime).format("YYYY-MM");
            trendMap.set(month, (trendMap.get(month) || 0) + 1);
          });
          const formattedTrend = Array.from(trendMap.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => (a.month < b.month ? -1 : 1))
            .slice(-6);
          setArticleTrend(formattedTrend);

          const dayCountMap = new Map<string, number>();
          (articleRecords || []).forEach((article) => {
            const dateKey = dayjs(article.publishedTime || article.createTime).format("YYYY-MM-DD");
            dayCountMap.set(dateKey, (dayCountMap.get(dateKey) || 0) + 1);
          });
          const daysToShow = 42;
          const startDate = dayjs().subtract(daysToShow - 1, "day");
          const calendar = Array.from({ length: daysToShow }).map((_, index) => {
            const date = startDate.add(index, "day");
            const key = date.format("YYYY-MM-DD");
            return {
              week: Math.floor(index / 7),
              day: date.day(),
              date: key,
              count: dayCountMap.get(key) || 0,
            };
          });
          setArticleCalendarData(calendar);
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

        const columnRes: any = await getColumnPage({ current: 1, pageSize: 1 });
        const columnPage = columnRes?.data?.data ?? columnRes?.data;
        if (!ignore) setColumnTotal(Number(columnPage?.total || 0));

        const rewardRes: any = await getRewardMessagePage({ current: 1, pageSize: 200 });
        const rewardPage = rewardRes?.data?.data ?? rewardRes?.data;
        let rewardRecords: API.RewardMessage[] = rewardPage?.records ?? [];
        if ((rewardPage?.total || 0) > rewardRecords.length) {
          const expandedRes: any = await getRewardMessagePage({ current: 1, pageSize: Math.min(rewardPage.total || 0, 500) });
          rewardRecords = expandedRes?.data?.records ?? rewardRecords;
        }
        if (!ignore) {
          const approved = rewardRecords.filter((item) => item.status === 1);
          const pending = rewardRecords.filter((item) => item.status === 0);
          const amount = rewardRecords.reduce((acc, item) => acc + Number(item.amount || 0), 0);
          setRewardStats({
            total: rewardPage?.total || rewardRecords.length,
            approved: approved.length,
            pending: pending.length,
            amount,
          });
          setRecentRewards(rewardRecords.slice(0, 5));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const articleColumns: ColumnsType<ArticleRow> = [
    { title: "文章标题", dataIndex: "title", key: "title", render: (text: string) => <a>{text}</a> },
    { title: "发布日期", dataIndex: "publishDate", key: "publishDate", render: (d?: string) => (d ? dayjs(d).format("YYYY-MM-DD HH:mm") : "-") },
    { title: "浏览量", dataIndex: "views", key: "views", render: (v?: number) => (v ?? 0).toLocaleString() },
    { title: "状态", dataIndex: "status", key: "status", render: (s?: number) => s === 1 ? <Tag color="green">已发布</Tag> : s === 2 ? <Tag color="gold">已归档</Tag> : <Tag>草稿</Tag> },
  ];

  const rewardColumns: ColumnsType<API.RewardMessage> = [
    { title: "昵称", dataIndex: "nickname", key: "nickname" },
    { title: "金额", dataIndex: "amount", key: "amount", render: (value?: number) => value ? `¥${Number(value).toFixed(2)}` : "-" },
    { title: "状态", dataIndex: "status", key: "status", render: (status?: number) => {
      if (status === 1) return <Tag color="green">已通过</Tag>;
      if (status === 2) return <Tag color="red">已拒绝</Tag>;
      return <Tag>待审核</Tag>;
    } },
    { title: "时间", dataIndex: "createTime", key: "createTime", render: (d?: string) => (d ? dayjs(d).format("MM-DD HH:mm") : "-") },
  ];

  const pieConfig = useMemo(() => ({
    data: tagDist.length > 0 ? tagDist : [{ name: "暂无数据", value: 1 }],
    angleField: "value",
    colorField: "name",
    radius: 0.8,
    label: {
      text: "name",
      position: "outside",
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  }), [tagDist]);

  const articleTrendConfig = useMemo(() => ({
    data: articleTrend.length > 0 ? articleTrend : [{ month: "暂无", count: 0 }],
    xField: "month",
    yField: "count",
    color: "#3f63ff",
    columnStyle: { radius: [6, 6, 0, 0] },
    tooltip: { showMarkers: false },
    interactions: [{ type: "active-region" }],
  }), [articleTrend]);

  const calendarConfig = useMemo(() => ({
    data: articleCalendarData,
    xField: "week",
    yField: "day",
    colorField: "count",
    color: ["#eef1ff", "#cdd4ff", "#a8b4ff", "#7d8cff", "#5b6af5"],
    meta: {
      week: {
        type: "cat",
        formatter: (val: number) => `第${Number(val) + 1}周`,
      },
      day: {
        type: "cat",
        formatter: (val: number) => `周${DAY_LABELS[val]}`,
      },
    },
    tooltip: {
      fields: ["date", "count"],
      formatter: (item: any) => ({
        name: item.date,
        value: `${item.count} 篇`,
      }),
    },
    yAxis: { grid: null },
    xAxis: { label: null, line: null },
    sizeField: 1,
  }), [articleCalendarData]);

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">仪表盘</h1>

      <Row gutter={[16, 16]} className="stats-row">
        {statsCards.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8} xl={6} xxl={6}>
            <Card className="stat-card" variant={false}>
              <div className="stat-card-content">
                <div className="stat-card-icon">{item.icon}</div>
                <div className="stat-card-text">
                  <span className="stat-card-title">{item.title}</span>
                  <span className="stat-card-value">
                    {item.formatter
                      ? item.formatter(item.value)
                      : Number(item.value ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24}>
          <Card title="文章发布热力图（近 6 周）" className="chart-card">
            {loading ? <Skeleton active /> : <Heatmap {...calendarConfig} />} 
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} xl={10}>
          <Card title="热门标签分布" className="chart-card">
            {loading ? <Skeleton active /> : <Pie {...pieConfig} />}
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card title="文章发布趋势 (近6个月)" className="chart-card">
            {loading ? <Skeleton active /> : <Column {...articleTrendConfig} />}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} xl={14}>
          <Card title="最近文章" className="table-card">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : articles.length > 0 ? (
              <Table columns={articleColumns} dataSource={articles} size="middle" pagination={{ pageSize: 8 }} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无文章" />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="最新打赏" className="table-card">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : recentRewards.length > 0 ? (
              <Table columns={rewardColumns} dataSource={recentRewards} size="small" pagination={false} rowKey={(record) => `${record.id}-${record.createTime}`} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无打赏记录" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
