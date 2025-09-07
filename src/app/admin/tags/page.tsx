'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  ColorPicker,
  message,
  Popconfirm,
  Card,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getTagPage } from '@/api/tagController';
import './styles.css';
import { formatDate } from '@/utils';

const { TextArea } = Input;
const { Option } = Select;

interface TagData {
  key: string;
  id?: number;
  name?: string;
  description?: string;
  color?: string;
  articleCount?: number;
  status?: 'active' | 'inactive';
  createDate?: Date;
  updateDate?: Date;
}

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 获取标签数据
  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await getTagPage({
          current: pagination.current,
          pageSize: pagination.pageSize,
          tagName: searchText || undefined
      }) as any;
      
      if (response?.code === 0 && response?.data) {
        const tagData = response.data.records?.map((tag: API.TagVo) => ({
          key: tag.id?.toString() || '',
          id: tag.id,
          name: tag.name,
          description: tag.description,
          color: tag.color || '#1890ff',
          articleCount: tag.articleCount,
          status: 'active' as const,
          createDate: formatDate(tag.createTime),
          updateDate: formatDate(tag.updateTime)
        })) || [];
        
        setTags(tagData);
        setPagination(prev => ({
          ...prev,
          total: response.data?.data?.total || 0
        }));
      }
    } catch (error) {
      console.error('获取标签数据失败:', error);
      message.error('获取标签数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchTags();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    form.setFieldsValue({
      color: '#1890ff',
      status: 'active'
    });
    setModalVisible(true);
  };

  const handleEdit = (record: TagData) => {
    setEditingTag(record);
    form.setFieldsValue({
      ...record
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number | undefined) => {
    if (!id) return;
    setTags(tags.filter(tag => tag.id !== id));
    message.success('标签删除成功');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (editingTag) {
        // 编辑标签
        setTags(tags.map(tag => 
          tag.id === editingTag.id 
            ? { 
                ...tag, 
                ...values, 
                color: typeof values.color === 'string' ? values.color : values.color.toHexString(),
                updateDate: new Date().toISOString().split('T')[0]
              }
            : tag
        ));
        message.success('标签更新成功');
      } else {
        // 新增标签
        const newTag: TagData = {
          ...values,
          key: Date.now().toString(),
          id: Date.now(),
          color: typeof values.color === 'string' ? values.color : values.color.toHexString(),
          articleCount: 0,
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0]
        };
        setTags([newTag, ...tags]);
        message.success('标签创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge status="success" text="启用" />
    ) : (
      <Badge status="default" text="禁用" />
    );
  };

  const filteredTags = tags.filter(tag => {
    const matchesSearch = (tag.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
                         (tag.description || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !statusFilter || tag.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<TagData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: TagData) => (
        <Space>
          <Tag color={record.color} icon={<TagOutlined />}>
            {text}
          </Tag>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>{text}</span>
      )
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <Space>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
              border: '1px solid #d9d9d9'
            }}
          />
          <span style={{ fontSize: 12, color: '#666' }}>{color}</span>
        </Space>
      )
    },
    {
      title: '文章数量',
      dataIndex: 'articleCount',
      key: 'articleCount',
      width: 100,
      sorter: (a, b) => (a.articleCount || 0) - (b.articleCount || 0),
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
      sorter: (a, b) => a.createDate - b.createDate,
    },
    {
      title: '更新日期',
      dataIndex: 'updateDate',
      key: 'updateDate',
      width: 120,
      sorter: (a, b) => a.updateDate - b.updateDate,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: TagData) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            description="删除后相关文章的标签关联也会被移除"
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
    <div className="tag-management">
      <Card>
        <div className="page-header">
          <h1>标签管理</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建标签
          </Button>
        </div>

        <div className="search-filters">
          <Space size="middle">
            <Input
              placeholder="搜索标签名称或描述"
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
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTags}
          loading={loading}
          pagination={{
            total: filteredTags.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="tag-modal"
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            color: '#1890ff'
          }}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 20, message: '标签名称不能超过20个字符' }
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="标签描述"
            rules={[
              { required: true, message: '请输入标签描述' },
              { max: 200, message: '描述不能超过200个字符' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请输入标签描述"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
          >
            <ColorPicker
              showText
              format="hex"
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#1890ff',
                    '#52c41a',
                    '#faad14',
                    '#f5222d',
                    '#722ed1',
                    '#fa541c',
                    '#13c2c2',
                    '#eb2f96',
                    '#2f54eb',
                    '#fa8c16'
                  ]
                }
              ]}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTag ? '更新' : '创建'}
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

export default TagManagement;