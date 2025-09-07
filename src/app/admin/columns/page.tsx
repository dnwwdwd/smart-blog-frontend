"use client";
import React, { useEffect, useState } from "react";
import type { UploadProps, UploadFile } from "antd";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  addColumn,
  deleteColumn,
  getColumnPage,
  updateColumn,
} from "@/api/columnController";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";
import { formatDate } from "@/utils";
import "@ant-design/v5-patch-for-react-19";

const { TextArea } = Input;
const { Option } = Select;

interface ColumnData {
  key?: string;
  id?: number;
  name?: string;
  description?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  articleCount?: number;
  subscriberCount?: number;
  status?: "active" | "inactive" | "completed";
  progress?: number;
  createDate?: string;
  updateDate?: string;
  createTime?: string;
  updateTime?: string;
}

const mockColumns: ColumnData[] = [
  {
    key: "1",
    id: 1,
    name: "React 从入门到精通",
    description:
      "全面系统地学习 React 框架，从基础概念到高级应用，包含实战项目案例",
    coverImage: "https://via.placeholder.com/200x120/61dafb/ffffff?text=React",
    author: "张三",
    category: "前端开发",
    articleCount: 25,
    subscriberCount: 1250,
    status: "active",
    progress: 80,
    createDate: "2025-01-01",
    updateDate: "2025-01-15",
  },
  {
    key: "2",
    id: 2,
    name: "Vue 3 实战指南",
    description: "Vue 3 Composition API 深度解析，结合实际项目开发经验分享",
    coverImage: "https://via.placeholder.com/200x120/4fc08d/ffffff?text=Vue",
    author: "李四",
    category: "前端开发",
    articleCount: 18,
    subscriberCount: 890,
    status: "active",
    progress: 60,
    createDate: "2025-01-05",
    updateDate: "2025-01-14",
  },
  {
    key: "3",
    id: 3,
    name: "TypeScript 高级教程",
    description: "深入理解 TypeScript 类型系统，掌握高级类型编程技巧",
    coverImage: "https://via.placeholder.com/200x120/3178c6/ffffff?text=TS",
    author: "王五",
    category: "编程语言",
    articleCount: 30,
    subscriberCount: 2100,
    status: "completed",
    progress: 100,
    createDate: "2024-12-01",
    updateDate: "2025-01-10",
  },
  {
    key: "4",
    id: 4,
    name: "Node.js 后端开发",
    description:
      "从零开始学习 Node.js 后端开发，包含 Express、数据库操作等内容",
    coverImage: "https://via.placeholder.com/200x120/339933/ffffff?text=Node",
    author: "赵六",
    category: "后端开发",
    articleCount: 22,
    subscriberCount: 1680,
    status: "active",
    progress: 75,
    createDate: "2024-11-15",
    updateDate: "2025-01-12",
  },
  {
    key: "5",
    id: 5,
    name: "Python 数据分析",
    description:
      "使用 Python 进行数据分析，涵盖 pandas、numpy、matplotlib 等库的使用",
    coverImage: "https://via.placeholder.com/200x120/3776ab/ffffff?text=Python",
    author: "孙七",
    category: "数据科学",
    articleCount: 15,
    subscriberCount: 750,
    status: "inactive",
    progress: 45,
    createDate: "2024-10-20",
    updateDate: "2025-01-08",
  },
];

const ColumnManagement: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnData | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取专栏数据
  const fetchColumns = async () => {
    setLoading(true);
    try {
      const res = (await getColumnPage({
        current: pagination.current,
        pageSize: pagination.pageSize,
        columnName: searchText || undefined,
      })) as any;

      if (res?.code === 0 && res?.data) {
        const columnsData =
          res.data.records?.map((item: any) => ({
            ...item,
            key: item.id?.toString() || Math.random().toString(),
            createDate: item.createTime,
            updateDate: item.updateTime,
          })) || [];
        setColumns(columnsData);
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.total || 0,
        }));
      } else {
        message.error(res?.message || "获取专栏数据失败");
      }
    } catch (error) {
      message.error("获取专栏数据失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (pagination.current === 1) {
      fetchColumns();
    } else {
      setPagination((prev) => ({ ...prev, current: 1 }));
    }
  }, [searchText, statusFilter, categoryFilter]);

  const handleAdd = () => {
    setEditingColumn(null);
    form.resetFields();
    setFileList([]);
    form.setFieldsValue({
      status: "active",
      category: "前端开发",
      progress: 0,
    });
    setModalVisible(true);
  };

  const handleEdit = (record: ColumnData) => {
    setEditingColumn(record);
    form.setFieldsValue({
      ...record,
    });
    // 设置现有图片到文件列表
    if (record.coverImage) {
      setFileList([
        {
          uid: '-1',
          name: 'cover.jpg',
          status: 'done',
          url: record.coverImage,
        },
      ]);
    } else {
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = (await deleteColumn(id)) as any;
      if (response?.code === 0) {
        message.success("专栏删除成功");
        fetchColumns(); // 重新获取数据
      } else {
        message.error(response?.message || "删除失败");
      }
    } catch (error) {
      message.error("删除失败，请重试");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingColumn) {
        // 编辑专栏
        const response = await updateColumn({
          id: editingColumn.id,
          ...values,
        });
        if (response.data?.code === 0) {
          message.success("专栏更新成功");
          fetchColumns(); // 重新获取数据
        } else {
          message.error(response.data?.message || "更新失败");
        }
      } else {
        // 新增专栏
        const response = await addColumn(values);
        if (response.data?.code === 0) {
          message.success("专栏创建成功");
          fetchColumns(); // 重新获取数据
        } else {
          message.error(response.data?.message || "创建失败");
        }
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(editingColumn ? "更新失败，请重试" : "创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const filteredColumns = columns.filter((column) => {
    const matchesSearch =
      (column.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (column.description || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || column.status === statusFilter;
    const matchesCategory =
      !categoryFilter || column.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/upload",
    listType: "picture-card",
    fileList,
    maxCount: 1,
    accept: "image/*",
    headers: {
      authorization: "authorization-text",
    },
    onChange(info) {
      setFileList(info.fileList);
      if (info.file.status === "done") {
        message.success(`图片上传成功`);
        // 更新表单中的coverImage字段
        form.setFieldsValue({
          coverImage: info.file.response?.url || info.file.url,
        });
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    onPreview: async (file) => {
      let src = file.url;
      if (!src) {
        src = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as File);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      const imgWindow = window.open(src);
      if (imgWindow) {
        imgWindow.document.write(`<img src="${src}" style="max-width: 100%; height: auto;" />`);
      }
    },
    onRemove: () => {
      form.setFieldsValue({ coverImage: undefined });
    },
  };

  const tableColumns: ColumnsType<ColumnData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: "封面",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 100,
      render: (coverImage: string, record: ColumnData) => (
        <Image
          src={coverImage}
          alt={record.name}
          width={60}
          height={40}
          style={{ borderRadius: 4 }}
          placeholder
        />
      ),
    },
    {
      title: "专栏名称",
      dataIndex: "name",
      key: "name",
      width: 120,
      ellipsis: true,
      render: (text: string, record: ColumnData) => (
        <Space direction="vertical" size={0}>
          <a onClick={() => handleEdit(record)} style={{ fontWeight: 500 }}>
            {text}
          </a>
          <span style={{ fontSize: 12, color: "#666" }}>
            {(record.description || "").length > 50
              ? `${(record.description || "").substring(0, 50)}...`
              : record.description || "-"}
          </span>
        </Space>
      ),
    },
    {
      title: "文章总数",
      dataIndex: "articleCount",
      key: "articleCount",
      width: 120,
      render: (articleCount: number) => <Tag color="blue">{articleCount}</Tag>,
    },
    {
      title: "创建日期",
      dataIndex: "createDate",
      key: "createDate",
      width: 120,
      render: (record: ColumnData) => (
        <span>{formatDate(record.createDate)}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_, record: ColumnData) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/column/${record.id}`, "_blank")}
          >
            预览
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个专栏吗？"
            description="删除后专栏下的所有文章关联也会被移除"
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
    <div className="column-management">
      <Card>
        <div className="page-header">
          <h1>专栏管理</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建专栏
          </Button>
        </div>

        <div className="search-filters">
          <Space size="middle" wrap>
            <Input
              placeholder="搜索专栏"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>
        </div>

        <Table
          columns={tableColumns}
          dataSource={filteredColumns}
          loading={loading}
          pagination={{
            total: filteredColumns.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingColumn ? "编辑专栏" : "新建专栏"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        className="column-modal"
        zIndex={2000}
        footer={
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
              >
                {editingColumn ? "更新" : "创建"}
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            category: "前端开发",
            progress: 0,
          }}
        >
          <Form.Item
            name="name"
            label="专栏名称"
            rules={[
              { required: true, message: "请输入专栏名称" },
              { max: 50, message: "专栏名称不能超过50个字符" },
            ]}
          >
            <Input placeholder="请输入专栏名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="专栏描述"
            rules={[
              { required: true, message: "请输入专栏描述" },
              { max: 500, message: "描述不能超过500个字符" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入专栏描述"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="封面图片"
            extra="建议尺寸：200x120px，支持 jpg、png 格式，最多上传1张"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ColumnManagement;