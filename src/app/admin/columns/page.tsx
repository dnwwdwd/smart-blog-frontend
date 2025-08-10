'use client';
import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Card,
  Badge,
  Image,
  Progress
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import './styles.css';

const { TextArea } = Input;
const { Option } = Select;

interface ColumnData {
  key: string;
  id: number;
  name: string;
  description: string;
  cover: string;
  author: string;
  category: string;
  articleCount: number;
  subscriberCount: number;
  status: 'active' | 'inactive' | 'completed';
  progress: number;
  createDate: string;
  updateDate: string;
}

const mockColumns: ColumnData[] = [
  {
    key: '1',
    id: 1,
    name: 'React 从入门到精通',
    description: '全面系统地学习 React 框架，从基础概念到高级应用，包含实战项目案例',
    cover: 'https://via.placeholder.com/200x120/61dafb/ffffff?text=React',
    author: '张三',
    category: '前端开发',
    articleCount: 25,
    subscriberCount: 1250,
    status: 'active',
    progress: 80,
    createDate: '2025-01-01',
    updateDate: '2025-01-15'
  },
  {
    key: '2',
    id: 2,
    name: 'Vue 3 实战指南',
    description: 'Vue 3 Composition API 深度解析，结合实际项目开发经验分享',
    cover: 'https://via.placeholder.com/200x120/4fc08d/ffffff?text=Vue',
    author: '李四',
    category: '前端开发',
    articleCount: 18,
    subscriberCount: 890,
    status: 'active',
    progress: 60,
    createDate: '2025-01-05',
    updateDate: '2025-01-14'
  },
  {
    key: '3',
    id: 3,
    name: 'TypeScript 高级教程',
    description: '深入理解 TypeScript 类型系统，掌握高级类型编程技巧',
    cover: 'https://via.placeholder.com/200x120/3178c6/ffffff?text=TS',
    author: '王五',
    category: '编程语言',
    articleCount: 30,
    subscriberCount: 2100,
    status: 'completed',
    progress: 100,
    createDate: '2024-12-01',
    updateDate: '2025-01-10'
  },
  {
    key: '4',
    id: 4,
    name: 'Node.js 后端开发',
    description: '从零开始学习 Node.js 后端开发，包含 Express、数据库操作等内容',
    cover: 'https://via.placeholder.com/200x120/339933/ffffff?text=Node',
    author: '赵六',
    category: '后端开发',
    articleCount: 22,
    subscriberCount: 1680,
    status: 'active',
    progress: 75,
    createDate: '2024-11-15',
    updateDate: '2025-01-12'
  },
  {
    key: '5',
    id: 5,
    name: 'Python 数据分析',
    description: '使用 Python 进行数据分析，涵盖 pandas、numpy、matplotlib 等库的使用',
    cover: 'https://via.placeholder.com/200x120/3776ab/ffffff?text=Python',
    author: '孙七',
    category: '数据科学',
    articleCount: 15,
    subscriberCount: 750,
    status: 'inactive',
    progress: 45,
    createDate: '2024-10-20',
    updateDate: '2025-01-08'
  }
];

const ColumnManagement: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(mockColumns);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnData | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const handleAdd = () => {
    setEditingColumn(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      category: '前端开发',
      progress: 0
    });
    setModalVisible(true);
  };

  const handleEdit = (record: ColumnData) => {
    setEditingColumn(record);
    form.setFieldsValue({
      ...record
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setColumns(columns.filter(column => column.id !== id));
    message.success('专栏删除成功');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingColumn) {
        // 编辑专栏
        setColumns(columns.map(column => 
          column.id === editingColumn.id 
            ? { 
                ...column, 
                ...values,
                updateDate: new Date().toISOString().split('T')[0]
              }
            : column
        ));
        message.success('专栏更新成功');
      } else {
        // 新增专栏
        const newColumn: ColumnData = {
          ...values,
          key: Date.now().toString(),
          id: Date.now(),
          articleCount: 0,
          subscriberCount: 0,
          cover: values.cover || 'https://via.placeholder.com/200x120/1890ff/ffffff?text=New',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0]
        };
        setColumns([newColumn, ...columns]);
        message.success('专栏创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '连载中';
      case 'completed':
        return '已完结';
      case 'inactive':
        return '已停更';
      default:
        return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#52c41a';
    if (progress >= 80) return '#1890ff';
    if (progress >= 60) return '#faad14';
    if (progress >= 40) return '#fa8c16';
    return '#f5222d';
  };

  const filteredColumns = columns.filter(column => {
    const matchesSearch = column.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         column.author.toLowerCase().includes(searchText.toLowerCase()) ||
                         column.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || column.status === statusFilter;
    const matchesCategory = !categoryFilter || column.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  const tableColumns: ColumnsType<ColumnData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (cover: string, record: ColumnData) => (
        <Image
          src={cover}
          alt={record.name}
          width={60}
          height={40}
          style={{ borderRadius: 4, objectFit: 'cover' }}
          placeholder
        />
      )
    },
    {
      title: '专栏名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: ColumnData) => (
        <Space direction="vertical" size={0}>
          <a onClick={() => handleEdit(record)} style={{ fontWeight: 500 }}>
            {text}
          </a>
          <span style={{ fontSize: 12, color: '#666' }}>
            {record.description.length > 50 
              ? `${record.description.substring(0, 50)}...` 
              : record.description
            }
          </span>
        </Space>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      sorter: (a, b) => a.articleCount - b.articleCount,
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '订阅数',
      dataIndex: 'subscriberCount',
      key: 'subscriberCount',
      width: 100,
      sorter: (a, b) => a.subscriberCount - b.subscriberCount,
      render: (count: number) => count.toLocaleString()
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          strokeColor={getProgressColor(progress)}
          format={(percent) => `${percent}%`}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '连载中', value: 'active' },
        { text: '已完结', value: 'completed' },
        { text: '已停更', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
      sorter: (a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: ColumnData) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/column/${record.id}`, '_blank')}
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
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
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
              placeholder="搜索专栏名称、作者或描述"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="active">连载中</Option>
              <Option value="completed">已完结</Option>
              <Option value="inactive">已停更</Option>
            </Select>
            <Select
              placeholder="筛选分类"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="前端开发">前端开发</Option>
              <Option value="后端开发">后端开发</Option>
              <Option value="移动开发">移动开发</Option>
              <Option value="数据科学">数据科学</Option>
              <Option value="人工智能">人工智能</Option>
              <Option value="编程语言">编程语言</Option>
            </Select>
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
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingColumn ? '编辑专栏' : '新建专栏'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className="column-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            category: '前端开发',
            progress: 0
          }}
        >
          <Form.Item
            name="name"
            label="专栏名称"
            rules={[
              { required: true, message: '请输入专栏名称' },
              { max: 50, message: '专栏名称不能超过50个字符' }
            ]}
          >
            <Input placeholder="请输入专栏名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="专栏描述"
            rules={[
              { required: true, message: '请输入专栏描述' },
              { max: 500, message: '描述不能超过500个字符' }
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
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              <Option value="前端开发">前端开发</Option>
              <Option value="后端开发">后端开发</Option>
              <Option value="移动开发">移动开发</Option>
              <Option value="数据科学">数据科学</Option>
              <Option value="人工智能">人工智能</Option>
              <Option value="编程语言">编程语言</Option>
              <Option value="运维部署">运维部署</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cover"
            label="封面图片"
            extra="建议尺寸：200x120px，支持 jpg、png 格式"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传封面</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="progress"
            label="完成进度 (%)"
            rules={[
              { required: true, message: '请输入完成进度' },
              { type: 'number', min: 0, max: 100, message: '进度必须在0-100之间' }
            ]}
          >
            <Input type="number" placeholder="请输入完成进度" min={0} max={100} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">连载中</Option>
              <Option value="completed">已完结</Option>
              <Option value="inactive">已停更</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingColumn ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ColumnManagement;