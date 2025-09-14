"use client";
import React, { useEffect, useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  addFriendLink,
  deleteFriendLink,
  getFriendLinkPage,
  updateFriendLink,
} from "@/api/friendLinkController";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";

const { TextArea } = Input;
const { Option } = Select;

interface FriendLinkData {
  key: string;
  id: number;
  name: string;
  description: string;
  avatar: string;
  url: string;
  isSpecial: boolean;
  statusLabel: string;
  sortOrder: number;
  status: number;
  createdTime: string;
  updatedTime: string;
  socialLinks?: any[];
}

const FriendLinkManagement: React.FC = () => {
  const [data, setData] = useState<FriendLinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FriendLinkData | null>(
    null
  );
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取友链列表
  const fetchFriendLinks = async (params?: any) => {
    setLoading(true);
    try {
      const searchValues = searchForm.getFieldsValue();
      const response = (await getFriendLinkPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        ...searchValues,
        ...params,
      })) as any;

      if (response?.code === 0 && response?.data) {
        const friendLinks =
          response.data.records?.map((item: any, index: number) => ({
            key: item.id?.toString() || index.toString(),
            ...item,
          })) || [];

        setData(friendLinks);
        setPagination((prev) => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      } else {
        message.error(response?.message || "获取友链列表失败");
      }
    } catch (error) {
      message.error("获取友链列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchFriendLinks();
  }, []);

  // 搜索
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchFriendLinks({ current: 1 });
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchFriendLinks({ current: 1 });
  };

  // 新增友链
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  // 编辑友链
  const handleEdit = (record: FriendLinkData) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      avatar: record.avatar,
      url: record.url,
      isSpecial: record.isSpecial,
      sortOrder: record.sortOrder,
      status: record.status,
    });
    // 设置现有头像到文件列表
    if (record.avatar) {
      setFileList([
        {
          uid: '-1',
          name: 'avatar.jpg',
          status: 'done',
          url: record.avatar,
        },
      ]);
    } else {
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  // 删除友链
  const handleDelete = async (id: number) => {
    try {
      // @ts-ignore deleteFriendLink 的类型定义期望对象参数，这里传入 id 临时忽略
      const response: any = await deleteFriendLink(id);
      if (response?.code === 0) {
        message.success("删除成功");
        fetchFriendLinks();
      } else {
        message.error(response?.message || "删除失败");
      }
    } catch (error) {
      console.error("删除友链失败:", error);
      message.error("删除失败");
    }
  };

  // 保存友链
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      let response;

      if (editingRecord) {
        response = (await updateFriendLink({
          ...values,
          id: editingRecord.id,
        })) as any;
      } else {
        response = (await addFriendLink({
          ...values,
          socialLinks: [], // 暂时为空数组
        })) as any;
      }

      if (response?.code === 0) {
        message.success(editingRecord ? "更新成功" : "添加成功");
        setIsModalVisible(false);
        await fetchFriendLinks();
      } else {
        message.error(
          response?.message || (editingRecord ? "更新失败" : "添加失败")
        );
      }
    } catch (error) {
      message.error(editingRecord ? "更新失败" : "添加失败");
    }
  };

  // 表格列定义
  const columns: ColumnsType<FriendLinkData> = [
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar: string, record) => (
        <Avatar
          src={avatar}
          icon={<UserOutlined />}
          size={40}
          alt={record.name}
        />
      ),
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (name: string) => (
        <span className="friend-link-name">{name}</span>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string) => (
        <span title={description}>{description}</span>
      ),
    },
    {
      title: "链接",
      dataIndex: "url",
      key: "url",
      width: 200,
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="friend-link-url"
        >
          <LinkOutlined /> {url}
        </a>
      ),
    },
    {
      title: "特殊标记",
      dataIndex: "isSpecial",
      key: "isSpecial",
      width: 100,
      render: (isSpecial: boolean) => (
        <Badge
          status={isSpecial ? "success" : "default"}
          text={isSpecial ? "特殊" : "普通"}
        />
      ),
    },
    {
      title: "状态标签",
      dataIndex: "statusLabel",
      key: "statusLabel",
      width: 100,
      render: (statusLabel: string) => {
        if (!statusLabel) return <span>/</span>;

        let color: string = "default";
        switch (statusLabel) {
          case "VIP":
            color = "orange";
            break;
          case "PREMIUM":
            color = "gold";
            break;
          default:
            color = "blue";
        }

        return <Tag color={color}>{statusLabel}</Tag>;
      },
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 80,
      sorter: true,
    },
    {
      title: "创建时间",
      dataIndex: "createdTime",
      key: "createdTime",
      width: 150,
      sorter: true,
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个友链吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div className="friend-link-management">
      <Card>
        <div className="page-header">
          <h2>友链管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增友链
          </Button>
        </div>

        {/* 搜索表单 */}
        <Card className="search-card" size="small">
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="name" label="名称">
              <Input placeholder="请输入友链名称" allowClear />
            </Form.Item>
            <Form.Item name="url" label="链接">
              <Input placeholder="请输入友链URL" allowClear />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                placeholder="请选择状态"
                allowClear
                style={{ width: 120 }}
              >
                <Option value={1}>正常</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: async (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10,
              }));
              await fetchFriendLinks({ current: page, pageSize });
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? "编辑友链" : "新增友链"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 1,
            isSpecial: false,
            sortOrder: 0,
          }}
        >
          <Form.Item
            name="name"
            label="友链名称"
            rules={[
              { required: true, message: "请输入友链名称" },
              { max: 50, message: "名称不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入友链名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="友链描述"
            rules={[
              { required: true, message: "请输入友链描述" },
              { max: 200, message: "描述不能超过200个字符" },
            ]}
          >
            <TextArea
              placeholder="请输入友链描述"
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            name="url"
            label="友链地址"
            rules={[
              { required: true, message: "请输入友链地址" },
              { type: "url", message: "请输入有效的URL地址" },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="头像地址"
            rules={[
              { required: true, message: "请输入头像地址" },
              { type: "url", message: "请输入有效的URL地址" },
            ]}
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序权重"
            tooltip="数值越大排序越靠前"
          >
            <InputNumber
              placeholder="请输入排序权重"
              min={0}
              max={999}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="isSpecial" label="特殊标记" valuePropName="checked">
            <Switch checkedChildren="特殊" unCheckedChildren="普通" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FriendLinkManagement;