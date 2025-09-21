"use client";
import React, { useState, useEffect, useCallback } from "react";
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
  Alert
} from "antd";
import {
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";
import { useSiteSettingsStore } from "@/stores/siteSettingsStore";

const { TextArea } = Input;
const { Option } = Select;

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteLogo?: string;
  favicon?: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  emailContact?: string;
  wechatQrUrl?: string;
  wechatPayQrUrl?: string;
  alipayQrUrl?: string;
  enableComments: boolean;
  enableSearch: boolean;
  enableDarkMode: boolean;
  articlesPerPage: number;
  googleAnalyticsId?: string;
  baiduAnalyticsId?: string;
  aiChatShortcut?: string;
}

// 捕获快捷键的只读输入组件：按下组合键自动生成形如 Ctrl+Alt+K 的字符串
const ShortcutInput: React.FC<{ value?: string; onChange?: (v?: string) => void; placeholder?: string }>
  = ({ value, onChange, placeholder }) => {
  const normalize = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const parts: string[] = [];
    const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

    if (e.ctrlKey) parts.push('Ctrl');
    if (e.metaKey) parts.push(isMac ? 'Cmd' : 'Meta');
    if (e.altKey) parts.push(isMac ? 'Option' : 'Alt');
    if (e.shiftKey) parts.push('Shift');

    // 过滤修饰键本身作为主键的情况
    const k = (e.key || '').toLowerCase();
    const isModifier = ['control','ctrl','meta','cmd','command','alt','option','shift'].includes(k);
    if (!isModifier) {
      let main = e.key;
      // 统一主键显示：单字符转大写，空格命名为 Space
      if (main.length === 1) main = main.toUpperCase();
      if (main === ' ') main = 'Space';
      // 修正常见键名
      if (main === 'ArrowUp' || main === 'ArrowDown' || main === 'ArrowLeft' || main === 'ArrowRight') {
        // 保持原样
      }
      parts.push(main);
    }

    return parts.join('+');
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // 避免事件冒泡到全局快捷键处理
    e.stopPropagation();

    // 功能键处理
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      onChange?.("");
      return;
    }
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      return;
    }

    // 组合键生成
    e.preventDefault();
    const combo = normalize(e);
    if (combo) onChange?.(combo);
  }, [normalize, onChange]);

  return (
    <Input
      readOnly
      value={value}
      onKeyDown={onKeyDown}
      placeholder={placeholder || "按下组合键，例如 Alt+K 或 Ctrl+Shift+J"}
      onChange={() => { /* readOnly，忽略原生输入 */ }}
    />
  );
};

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const { settings, loading: settingsLoading, error, fetchSiteSettings, saveSiteSettings } =
    useSiteSettingsStore();

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [aboutImageList, setAboutImageList] = useState<UploadFile[]>([]);
  const [faviconList, setFaviconList] = useState<UploadFile[]>([]);

  useEffect(() => {
    // 若无全局设置，进入页面时拉取一次
    if (!settings) {
      fetchSiteSettings();
    } else {
      // settings 已存在时同步到表单
      setTimeout(() => {
        form.setFieldsValue(settings as any);
      }, 0);
    }
  }, [settings, fetchSiteSettings, form]);

  const handleSubmit = async (values: SiteSettings) => {
    setLoading(true);
    try {
      const settingData: API.SettingConfig = { ...(values as any) };
      const ok = await saveSiteSettings(settingData);
      if (ok) {
        message.success("设置保存成功");
      } else {
        message.error("保存失败");
      }
    } catch (error) {
      message.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      form.setFieldsValue(settings as any);
      message.info("已重置为当前保存的设置");
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("只能上传图片文件!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不能超过 2MB!");
        return false;
      }
      return false;
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

  // 根据 store 的 loading / error 精确反馈 UI，避免永远“加载中”。
  if (!settings) {
    if (settingsLoading) {
      return <div>加载中...</div>;
    }
    return (
      <div className="system-settings">
        <Card>
          <div className="page-header">
            <h1>系统设置</h1>
          </div>
          <Alert
            type="error"
            showIcon
            message="加载站点设置失败"
            description={error || "未获取到站点设置，请检查后端服务或登录状态。"}
            style={{ marginBottom: 16 }}
          />
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchSiteSettings()}>
              重试加载
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

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
              onClick={() => form.submit()}
              loading={loading}
            >
              保存
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={settings as any}
        >
          {/* 网站信息等 Tab 使用 items API */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'basic',
                label: '网站信息',
                children: (
                  <div className="tab-content">
                    <Form.Item
                      label="站点名称"
                      name="siteName"
                      rules={[{ required: true, message: "请输入站点名称" }]}
                    >
                      <Input placeholder="请输入站点名称" />
                    </Form.Item>
                    <Form.Item label="站点描述" name="siteDescription">
                      <Input placeholder="请输入站点描述" />
                    </Form.Item>
                    <Form.Item label="站点关键词" name="siteKeywords">
                      <Input placeholder="请输入站点关键词，逗号分隔" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'about',
                label: '关于页面',
                children: (
                  <div className="tab-content">
                    <Form.Item label="关于页标题" name="aboutTitle">
                      <Input placeholder="例如：关于 Smart Blog" />
                    </Form.Item>
                    <Form.Item label="关于页内容" name="aboutContent">
                      <TextArea placeholder="关于页面简介内容" rows={4} />
                    </Form.Item>
                    <Form.Item label="关于页头像/头图 URL" name="aboutImage">
                      <Input placeholder="请输入图片链接" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'seo',
                label: 'SEO 设置',
                children: (
                  <div className="tab-content">
                    <Form.Item label="SEO 标题" name="seoTitle">
                      <Input placeholder="请输入 SEO 标题" />
                    </Form.Item>
                    <Form.Item label="SEO 描述" name="seoDescription">
                      <Input placeholder="请输入 SEO 描述" />
                    </Form.Item>
                    <Form.Item label="SEO 关键词" name="seoKeywords">
                      <Input placeholder="请输入 SEO 关键词" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'social',
                label: '社交媒体',
                children: (
                  <div className="tab-content">
                    <Form.Item label="GitHub" name="githubUrl">
                      <Input placeholder="https://github.com/username" />
                    </Form.Item>
                    <Form.Item label="Twitter / X" name="twitterUrl">
                      <Input placeholder="https://x.com/username" />
                    </Form.Item>
                    <Form.Item label="联系邮箱" name="emailContact">
                      <Input placeholder="you@example.com" />
                    </Form.Item>
                    <Form.Item label="微信二维码" name="wechatQrUrl">
                      <Input placeholder="图片链接或上传后地址" />
                    </Form.Item>
                    <Form.Item label="微信收款码" name="wechatPayQrUrl">
                      <Input placeholder="图片链接或上传后地址" />
                    </Form.Item>
                    <Form.Item label="支付宝收款码" name="alipayQrUrl">
                      <Input placeholder="图片链接或上传后地址" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: 'features',
                label: '功能设置',
                children: (
                  <>
                    <Form.Item
                      label="启用评论"
                      name="enableComments"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label="启用搜索"
                      name="enableSearch"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      label="启用暗色模式"
                      name="enableDarkMode"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item label="每页文章数" name="articlesPerPage">
                      <InputNumber min={1} max={100} />
                    </Form.Item>
                    <Form.Item
                      label="AI 聊天快捷键"
                      name="aiChatShortcut"
                      tooltip="在输入框中直接按下组合键（Backspace 清空，Esc 取消）。Mac 会显示为 Cmd/Option。"
                      rules={[{ max: 40, message: '长度不要超过 40 个字符' }]}
                    >
                      <ShortcutInput placeholder="按下组合键，例如 Alt+K 或 Ctrl+Shift+J" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'analytics',
                label: '统计设置',
                children: (
                  <div className="tab-content">
                    <Form.Item label="Google Analytics ID" name="googleAnalyticsId">
                      <Input placeholder="G-XXXXXXX" />
                    </Form.Item>
                    <Form.Item label="百度统计 ID" name="baiduAnalyticsId">
                      <Input placeholder="XXXXXXXX" />
                    </Form.Item>
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;
