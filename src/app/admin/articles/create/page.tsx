'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  message,
  Divider,
  Switch,
  InputNumber,
  Row,
  Col,
  Upload
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { Editor, Viewer } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import frontmatter from '@bytemd/plugin-frontmatter';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/default.css';
import './styles.css';

const { TextArea } = Input;
const { Option } = Select;

interface ArticleForm {
  title: string;
  content: string;
  excerpt?: string;
  columnId?: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status: 'draft' | 'published';
  allowComments: boolean;
  featured: boolean;
  readTime?: number;
}

// 模拟数据
const mockColumns = [
  { id: 1, name: '前端开发', description: '前端技术相关文章' },
  { id: 2, name: '后端开发', description: '后端技术相关文章' },
  { id: 3, name: '编程语言', description: '各种编程语言学习' },
  { id: 4, name: '运维部署', description: '运维和部署相关' }
];

const mockTags = [
  'React', 'Vue', 'JavaScript', 'TypeScript', 'Node.js',
  'Python', 'Java', 'Docker', 'Kubernetes', 'AWS'
];

const ArticleCreate: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [article, setArticle] = useState<ArticleForm>({
    title: '',
    content: '',
    tags: [],
    status: 'draft',
    allowComments: true,
    featured: false
  });

  // ByteMD 插件配置
  const plugins = [
    gfm(),
    highlight(),
    frontmatter(),
    mediumZoom()
  ];

  // 模拟图片上传函数
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // 模拟上传延迟
      setTimeout(() => {
        // 实际项目中这里应该是真实的上传逻辑
        const mockUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
        resolve(mockUrl);
      }, 1000);
    });
  };
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [availableTags, setAvailableTags] = useState(mockTags);

  // 监听表单变化
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: keyof ArticleForm, value: any) => {
    setArticle(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!article.title.trim()) {
      message.error('请输入文章标题');
      return;
    }
    if (!article.content.trim()) {
      message.error('请输入文章内容');
      return;
    }

    try {
      // 这里应该调用API保存文章
      console.log('保存文章:', { ...article, status });
      message.success(status === 'draft' ? '草稿保存成功' : '文章发布成功');
      setHasUnsavedChanges(false);
      
      if (status === 'published') {
        router.push('/admin/articles');
      }
    } catch (error) {
      message.error('保存失败，请重试');
    }
  };



  const handleBack = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认离开',
        content: '您有未保存的更改，确定要离开吗？',
        onOk: () => router.push('/admin/articles'),
        okText: '确定',
        cancelText: '取消'
      });
    } else {
      router.push('/admin/articles');
    }
  };

  const handleAddCustomTag = () => {
    if (customTag && !availableTags.includes(customTag)) {
      setAvailableTags(prev => [...prev, customTag]);
      setArticle(prev => ({ ...prev, tags: [...prev.tags, customTag] }));
      setCustomTag('');
      setHasUnsavedChanges(true);
      message.success('标签添加成功');
    }
  };

  const handleSettingsSubmit = (values: any) => {
    setArticle(prev => ({ ...prev, ...values }));
    setSettingsVisible(false);
    setHasUnsavedChanges(true);
    message.success('设置保存成功');
  };

  const handleCloseSettings = () => {
    Modal.confirm({
      title: '确认关闭',
      content: '关闭设置窗口可能会丢失未保存的更改，确定要关闭吗？',
      onOk: () => setSettingsVisible(false),
      okText: '确定',
      cancelText: '取消'
    });
  };

  return (
    <div className="article-create">
      {/* 顶部工具栏 */}
      <div className="toolbar">
        <div className="toolbar-left">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="text"
          >
            返回列表
          </Button>
        </div>
        <div className="toolbar-right">
          <Space>

            <Button 
              icon={<SettingOutlined />} 
              onClick={() => setSettingsVisible(true)}
            >
              设置
            </Button>
            <Button 
              icon={<SaveOutlined />} 
              onClick={() => handleSave('draft')}
            >
              保存草稿
            </Button>
            <Button 
              type="primary" 
              onClick={() => handleSave('published')}
            >
              发布文章
            </Button>
          </Space>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="main-editor">
        <div className="title-input">
          <Input
            placeholder="请输入文章标题..."
            value={article.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="title-field"
            size="large"
            style={{ marginBottom: 16 }}
          />
        </div>
        
        <div className="bytemd-editor">
           <Editor
             value={article.content}
             plugins={plugins}
             onChange={(value) => handleInputChange('content', value)}
             uploadImages={async (files) => {
               const results = [];
               for (const file of files) {
                 try {
                   const url = await uploadImage(file);
                   results.push({
                     url,
                     alt: file.name,
                     title: file.name
                   });
                 } catch (error) {
                   message.error(`图片 ${file.name} 上传失败`);
                 }
               }
               return results;
             }}
           />
        </div>
      </div>

      {/* 设置弹窗 */}
      <Modal
        title="文章设置"
        open={settingsVisible}
        onCancel={handleCloseSettings}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={article}
          onFinish={handleSettingsSubmit}
        >
          <Form.Item label="文章摘要" name="excerpt">
            <TextArea 
              placeholder="请输入文章摘要（可选）" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label="所属专栏" name="columnId">
            <Select placeholder="选择专栏（可选）" allowClear>
              {mockColumns.map(column => (
                <Option key={column.id} value={column.id}>
                  {column.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="文章标签" name="tags">
            <Select
              mode="multiple"
              placeholder="选择或创建标签"
              value={article.tags}
              onChange={(value) => handleInputChange('tags', value)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="自定义标签"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onPressEnter={handleAddCustomTag}
                    />
                    <Button 
                      type="text" 
                      icon={<PlusOutlined />} 
                      onClick={handleAddCustomTag}
                    >
                      添加
                    </Button>
                  </Space>
                </>
              )}
            >
              {availableTags.map(tag => (
                <Option key={tag} value={tag}>
                  <Tag>{tag}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>SEO 设置</Divider>

          <Form.Item label="SEO 标题" name="seoTitle">
            <Input placeholder="SEO 标题（可选）" maxLength={60} showCount />
          </Form.Item>

          <Form.Item label="SEO 描述" name="seoDescription">
            <TextArea 
              placeholder="SEO 描述（可选）" 
              rows={2} 
              maxLength={160} 
              showCount 
            />
          </Form.Item>

          <Form.Item label="SEO 关键词" name="seoKeywords">
            <Input placeholder="SEO 关键词，用逗号分隔（可选）" />
          </Form.Item>

          <Divider>其他设置</Divider>

          <Form.Item label="预计阅读时间（分钟）" name="readTime">
            <InputNumber min={1} max={999} placeholder="自动计算" />
          </Form.Item>

          <Form.Item name="allowComments" valuePropName="checked">
            <Switch checkedChildren="允许评论" unCheckedChildren="禁止评论" />
          </Form.Item>

          <Form.Item name="featured" valuePropName="checked">
            <Switch checkedChildren="推荐文章" unCheckedChildren="普通文章" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button onClick={handleCloseSettings}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
};

export default ArticleCreate;