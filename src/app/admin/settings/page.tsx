"use client";
import React, { useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Switch,
  Tabs,
  Upload,
} from "antd";
import {
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";

const { TextArea } = Input;
const { Option } = Select;

interface SiteSettings {
  // 基础信息
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteLogo?: string;
  favicon?: string;
  
  // 关于页面
  aboutTitle: string;
  aboutContent: string;
  aboutImage?: string;
  
  // SEO 设置
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  
  // 社交媒体
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  emailContact?: string;
  
  // 功能设置
  enableComments: boolean;
  enableSearch: boolean;
  enableDarkMode: boolean;
  articlesPerPage: number;
  
  // 统计设置
  googleAnalyticsId?: string;
  baiduAnalyticsId?: string;
}

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // 模拟当前设置数据
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Smart Blog',
    siteDescription: '一个智能的博客系统',
    siteKeywords: '博客,技术,分享,学习',
    aboutTitle: '关于我们',
    aboutContent: '这里是关于页面的内容介绍...',
    seoTitle: 'Smart Blog - 智能博客系统',
    seoDescription: '一个基于 Next.js 和 Ant Design 构建的现代化博客系统',
    seoKeywords: '博客,Next.js,React,技术分享',
    enableComments: true,
    enableSearch: true,
    enableDarkMode: true,
    articlesPerPage: 10
  });
  
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aboutImageList, setAboutImageList] = useState<UploadFile[]>([]);
  const [faviconList, setFaviconList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: SiteSettings) => {
    setLoading(true);
    try {
      // 这里应该调用API保存设置
      console.log('保存设置:', values);
      setSettings(values);
      message.success('设置保存成功');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(settings);
    message.info('已重置为当前保存的设置');
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
  };

  const aboutImageProps: UploadProps = {
    ...uploadProps,
    onChange: (info) => {
      setAboutImageList(info.fileList);
    },
  };

  const faviconProps: UploadProps = {
    ...uploadProps,
    onChange: (info) => {
      setFaviconList(info.fileList);
    },
  };

  return (
    <div className="system-settings">
      <Card>
        <div className="page-header">
          <h1>系统设置</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              loading={loading}
              onClick={() => form.submit()}
            >
              保存设置
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFinish={handleSubmit}
          className="settings-form"
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'basic',
                label: '基础设置',
                children: (
                  <div className="tab-content">
                    <Form.Item 
                      label="网站名称" 
                      name="siteName" 
                      rules={[{ required: true, message: '请输入网站名称' }]}
                    >
                      <Input placeholder="请输入网站名称" />
                    </Form.Item>

                    <Form.Item 
                      label="网站描述" 
                      name="siteDescription"
                      rules={[{ required: true, message: '请输入网站描述' }]}
                    >
                      <TextArea 
                        placeholder="请输入网站描述" 
                        rows={3} 
                        maxLength={200}
                        showCount
                      />
                    </Form.Item>

                    <Form.Item label="网站关键词" name="siteKeywords">
                      <Input placeholder="请输入网站关键词，用逗号分隔" />
                    </Form.Item>

                    <Form.Item label="网站Logo">
                      <Upload
                        {...uploadProps}
                        fileList={fileList}
                        listType="picture-card"
                        maxCount={1}
                      >
                        {fileList.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传Logo</div>
                          </div>
                        )}
                      </Upload>
                      <div className="upload-tip">建议尺寸：200x60px，支持 PNG、JPG 格式</div>
                    </Form.Item>

                    <Form.Item label="网站图标 (Favicon)">
                      <Upload
                        {...faviconProps}
                        fileList={faviconList}
                        listType="picture-card"
                        maxCount={1}
                      >
                        {faviconList.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传图标</div>
                          </div>
                        )}
                      </Upload>
                      <div className="upload-tip">建议尺寸：32x32px，支持 ICO、PNG 格式</div>
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'about',
                label: '关于页面',
                children: (
                  <div className="tab-content">
                    <Form.Item 
                      label="关于页面标题" 
                      name="aboutTitle"
                      rules={[{ required: true, message: '请输入关于页面标题' }]}
                    >
                      <Input placeholder="请输入关于页面标题" />
                    </Form.Item>

                    <Form.Item 
                      label="关于页面内容" 
                      name="aboutContent"
                      rules={[{ required: true, message: '请输入关于页面内容' }]}
                    >
                      <TextArea 
                        placeholder="请输入关于页面内容，支持 Markdown 格式" 
                        rows={10}
                        maxLength={2000}
                        showCount
                      />
                    </Form.Item>

                    <Form.Item label="关于页面配图">
                      <Upload
                        {...aboutImageProps}
                        fileList={aboutImageList}
                        listType="picture-card"
                        maxCount={1}
                      >
                        {aboutImageList.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传配图</div>
                          </div>
                        )}
                      </Upload>
                      <div className="upload-tip">建议尺寸：800x400px，支持 PNG、JPG 格式</div>
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'seo',
                label: 'SEO 设置',
                children: (
                  <div className="tab-content">
                    <Form.Item label="SEO 标题" name="seoTitle">
                      <Input placeholder="请输入 SEO 标题" maxLength={60} showCount />
                    </Form.Item>

                    <Form.Item label="SEO 描述" name="seoDescription">
                      <TextArea 
                        placeholder="请输入 SEO 描述" 
                        rows={3} 
                        maxLength={160} 
                        showCount 
                      />
                    </Form.Item>

                    <Form.Item label="SEO 关键词" name="seoKeywords">
                      <Input placeholder="请输入 SEO 关键词，用逗号分隔" />
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'social',
                label: '社交媒体',
                children: (
                  <div className="tab-content">
                    <Form.Item label="GitHub 链接" name="githubUrl">
                      <Input placeholder="https://github.com/username" />
                    </Form.Item>

                    <Form.Item label="Twitter 链接" name="twitterUrl">
                      <Input placeholder="https://twitter.com/username" />
                    </Form.Item>

                    <Form.Item label="LinkedIn 链接" name="linkedinUrl">
                      <Input placeholder="https://linkedin.com/in/username" />
                    </Form.Item>

                    <Form.Item label="联系邮箱" name="emailContact">
                      <Input placeholder="contact@example.com" type="email" />
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'features',
                label: '功能设置',
                children: (
                  <div className="tab-content">
                    <Form.Item label="评论功能" name="enableComments" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item label="搜索功能" name="enableSearch" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item label="深色模式" name="enableDarkMode" valuePropName="checked">
                      <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                    </Form.Item>

                    <Form.Item label="每页文章数量" name="articlesPerPage">
                      <InputNumber min={5} max={50} placeholder="10" />
                    </Form.Item>
                  </div>
                )
              },
              {
                key: 'analytics',
                label: '统计设置',
                children: (
                  <div className="tab-content">
                    <Form.Item label="Google Analytics ID" name="googleAnalyticsId">
                      <Input placeholder="G-XXXXXXXXXX" />
                    </Form.Item>

                    <Form.Item label="百度统计 ID" name="baiduAnalyticsId">
                      <Input placeholder="请输入百度统计 ID" />
                    </Form.Item>

                    <div className="analytics-tip">
                      <p>📊 统计代码将自动添加到网站页面中</p>
                      <p>🔒 统计 ID 信息将被安全存储</p>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;