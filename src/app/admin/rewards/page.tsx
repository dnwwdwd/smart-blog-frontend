"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Modal,
  Form,
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatDateTime } from "@/utils";
import { useRewardMessageStore } from "@/stores/rewardMessageStore";
import "./styles.css";

const statusTagMap: Record<number, { color: string; label: string }> = {
  0: { color: "default", label: "待审核" },
  1: { color: "success", label: "已通过" },
  2: { color: "error", label: "已拒绝" },
};

const ReviewStatusOptions = [
  { label: "全部状态", value: "" },
  { label: "待审核", value: "0" },
  { label: "已通过", value: "1" },
  { label: "已拒绝", value: "2" },
];

const RewardsAdminPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<API.RewardMessage[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    id: number;
    status: number;
  } | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    amount: 0,
    approvedAmount: 0,
  });

  const [form] = Form.useForm<{ reviewRemark?: string }>();
  const fetchRewardPage = useRewardMessageStore((state) => state.fetchPage);
  const reviewReward = useRewardMessageStore((state) => state.review);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    const pageSize = 100;
    const maxPages = 5;
    let current = 1;
    let aggregated: API.RewardMessage[] = [];
    let total = 0;
    while (current <= maxPages) {
      const res = await fetchRewardPage({
        current,
        pageSize,
      });
      if (!res) break;
      total = res.total || total;
      aggregated = aggregated.concat(res.records || []);
      if (!res.records || res.records.length < pageSize || aggregated.length >= (res.total || 0)) {
        break;
      }
      current += 1;
    }
    const approved = aggregated.filter((item) => item.status === 1);
    const pending = aggregated.filter((item) => item.status === 0);
    const amount = aggregated.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    const approvedAmount = approved.reduce((acc, item) => acc + Number(item.amount || 0), 0);
    setSummary({
      total: total || aggregated.length,
      pending: pending.length,
      approved: approved.length,
      amount,
      approvedAmount,
    });
    setSummaryLoading(false);
  }, [fetchRewardPage]);

  const loadData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setTableLoading(true);
    const payload: API.RewardMessageQueryRequest = {
      current: page,
      pageSize,
      status: statusFilter ? Number(statusFilter) : undefined,
      keyword: keyword || undefined,
    };
    const res = await fetchRewardPage(payload);
    if (res) {
      setDataSource(res.records || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: res.total || 0,
      }));
    }
    setTableLoading(false);
  };

  useEffect(() => {
    loadData(1, pagination.pageSize);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, keyword, loadSummary]);

  const columns: ColumnsType<API.RewardMessage> = [
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      render: (text) => text || "-",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: (text) => text || "-",
    },
    {
      title: "网站",
      dataIndex: "website",
      key: "website",
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "留言内容",
      dataIndex: "message",
      key: "message",
      width: 260,
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        const meta = statusTagMap[value ?? 0] || statusTagMap[0];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "审核备注",
      dataIndex: "reviewRemark",
      key: "reviewRemark",
      render: (text) => text || "-",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (text) => (text ? formatDateTime(text) : "-"),
    },
    {
      title: "审核时间",
      dataIndex: "reviewTime",
      key: "reviewTime",
      render: (text) => (text ? formatDateTime(text) : "-"),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        const actions: React.ReactNode[] = [];
        if (record.status !== 1) {
          actions.push(
            <Button
              key="approve"
              type="link"
              onClick={() => openReviewModal(record.id!, 1)}
            >
              通过
            </Button>
          );
        }
        if (record.status !== 2) {
          actions.push(
            <Button
              key="reject"
              type="link"
              danger
              onClick={() => openReviewModal(record.id!, 2)}
            >
              拒绝
            </Button>
          );
        }
        if (actions.length === 0) {
          return <span>-</span>;
        }
        return <Space size={8}>{actions}</Space>;
      },
    },
  ];

  const openReviewModal = (id: number, status: number) => {
    setReviewTarget({ id, status });
    form.resetFields();
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!reviewTarget) return;
      setReviewSubmitting(true);
      const success = await reviewReward(reviewTarget.id, {
        status: reviewTarget.status,
        reviewRemark: values.reviewRemark,
      });
      if (success) {
        message.success("审核操作成功");
        setReviewModalVisible(false);
        setReviewTarget(null);
        await Promise.all([loadData(), loadSummary()]);
      } else {
        message.error("审核操作失败，请重试");
      }
    } catch {
      // 表单校验失败时不处理
      return;
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleTableChange = (paginationConfig: any) => {
    loadData(paginationConfig.current, paginationConfig.pageSize);
  };

  return (
    <div className="admin-page rewards-page">
      <Row gutter={[16, 16]} className="rewards-stats-row">
        <Col xs={12} lg={6}>
          <Card loading={summaryLoading}>
            <Statistic title="打赏总数" value={summary.total} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card loading={summaryLoading}>
            <Statistic title="待审核" value={summary.pending} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card loading={summaryLoading}>
            <Statistic title="已通过" value={summary.approved} />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card loading={summaryLoading}>
            <Statistic title="累计金额" value={summary.amount} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Card
        title="打赏留言审核"
        style={{ marginTop: 12 }}
        extra={
          <div className="rewards-toolbar">
            <Input.Search
              allowClear
              placeholder="搜索昵称或留言"
              onSearch={(value) => setKeyword(value.trim())}
              onChange={(event) => {
                if (event.target.value === "") {
                  setKeyword("");
                }
              }}
              style={{ width: 220 }}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={ReviewStatusOptions}
              style={{ width: 140 }}
            />
            <Button onClick={() => loadData()}>刷新</Button>
          </div>
        }
      >
        <Table
          rowKey={(record) => record.id ?? `${record.email}-${record.createTime}`}
          loading={tableLoading}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={
          reviewTarget?.status === 1 ? "通过留言" : "拒绝留言"
        }
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleReviewSubmit}
        confirmLoading={reviewSubmitting}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="审核备注"
            name="reviewRemark"
            rules={[
              { max: 200, message: "审核备注不能超过200个字符" },
            ]}
          >
            <Input.TextArea
              placeholder="可选，填写审核备注"
              rows={4}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RewardsAdminPage;
