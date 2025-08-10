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
  DatePicker,
  Upload,
  message,
  Popconfirm,
  Card
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import './styles.css';

const { TextArea } = Input;
const { Option } = Select;

interface Article {
  key: string;
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft' | 'archived';
  publishDate: string;
  views: number;
  likes: number;
  excerpt: string;
}

const mockArticles: Article[] = [
  {
    key: '1',
    id: 1,
    title: 'React 18 新特性详解',
    author: '张三',
    category: '前端开发',
    tags: ['React', 'JavaScript', '前端'],
    status: 'published',
    publishDate: '2025-01-15',
    views: 1250,
    likes: 89,
    excerpt: '深入解析 React 18 的新特性，包括并发渲染、自动批处理等重要更新。'
  },
  {
    key: '2',
    id: 2,
    title: 'Vue 3 Composition API 实战',
    author: '李四',
    category: '前端开发',
    tags: ['Vue', 'JavaScript', 'Composition API'],
    status: 'published',
    publishDate: '2025-01-14',
    views: 980,
    likes: 67,
    excerpt: '通过实际项目案例，学习 Vue 3 Composition API 的使用技巧。'
  },
  {
    key: '3',
    id: 3,
    title: 'TypeScript 高级类型系统',
    author: '王五',
    category: '编程语言',
    tags: ['TypeScript', '类型系统'],
    status: 'draft',
    publishDate: '2025-01-13',
    views: 756,
    likes: 45,
    excerpt: '深入理解 TypeScript 的高级类型特性，提升代码质量和开发效率。'
  },
  {
    key: '4',
    id: 4,
    title: 'Node.js 性能优化指南',
    author: '赵六',
    category: '后端开发',
    tags: ['Node.js', '性能优化', '后端'],
    status: 'published',
    publishDate: '2025-01-12',
    views: 1100,
    likes: 78,
    excerpt: '全面介绍 Node.js 应用的性能优化策略和最佳实践。'
  },
  {
    key: '5',
    id: 5,
    title: 'Docker 容器化部署实践',
    author: '孙七',
    category: '运维部署',
    tags: ['Docker', '容器化', '部署'],
    status: 'archived',
    publishDate: '2025-01-11',
    views: 890,
    likes: 56,
    excerpt: '从零开始学习 Docker 容器化技术，实现应用的快速部署。'
  }
];

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');



  const handleEdit = (record: Article) => {
    setEditingArticle(record);
    form.setFieldsValue({
      ...record,
      publishDate: record.publishDate
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setArticles(articles.filter(article => article.id !== id));
    message.success('文章删除成功');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingArticle) {
        // 编辑文章
        setArticles(articles.map(article => 
          article.id === editingArticle.id 
            ? { ...article, ...values, key: article.key }
            : article
        ));
        message.success('文章更新成功');
      } else {
        // 新增文章
        const newArticle: Article = {
          ...values,
          key: Date.now().toString(),
          id: Date.now(),
          views: 0,
          likes: 0
        };
        setArticles([newArticle, ...articles]);
        message.success('文章创建成功');
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
      case 'published':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'archived':
        return '已归档';
      default:
        return status;
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<Article> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Article) => (
        <a onClick={() => handleEdit(record)}>{text}</a>
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
      width: 120
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </>
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
        { text: '已发布', value: 'published' },
        { text: '草稿', value: 'draft' },
        { text: '已归档', value: 'archived' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
      sorter: (a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => a.views - b.views,
      render: (views: number) => views.toLocaleString()
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      sorter: (a, b) => a.likes - b.likes
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: Article) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/article/${record.id}`, '_blank')}
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
            title="确定要删除这篇文章吗？"
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
    <div className="article-management">
      <Card>
        <div className="page-header">
          <h1>文章管理</h1>
          <Link href="/admin/articles/create">
            <Button type="primary" icon={<PlusOutlined />}>
              新建文章
            </Button>
          </Link>
        </div>

        <div className="search-filters">
          <Space size="middle">
            <Input
              placeholder="搜索文章标题或作者"
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
              <Option value="published">已发布</Option>
              <Option value="draft">草稿</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredArticles}
          loading={loading}
          pagination={{
            total: filteredArticles.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingArticle ? '编辑文章' : '新建文章'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className="article-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'draft',
            category: '前端开发'
          }}
        >
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
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
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <Select
              mode="tags"
              placeholder="请选择或输入标签"
              options={[
                { value: 'React', label: 'React' },
                { value: 'Vue', label: 'Vue' },
                { value: 'JavaScript', label: 'JavaScript' },
                { value: 'TypeScript', label: 'TypeScript' },
                { value: 'Node.js', label: 'Node.js' },
                { value: 'Python', label: 'Python' },
                { value: 'Java', label: 'Java' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="文章摘要"
            rules={[{ required: true, message: '请输入文章摘要' }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入文章摘要"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
              <Option value="archived">归档</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="publishDate"
            label="发布日期"
            rules={[{ required: true, message: '请选择发布日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingArticle ? '更新' : '创建'}
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

export default ArticleManagement;