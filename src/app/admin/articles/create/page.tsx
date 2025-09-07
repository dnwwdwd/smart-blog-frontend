"use client";

import React, { useEffect, useRef, useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Tooltip,
  Upload,
} from "antd";

import {
  FileImageOutlined,
  FolderOutlined,
  SaveOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { publishArticle } from "@/api/articleController";
import { getColumnPage } from "@/api/columnController";
import { getTagPage } from "@/api/tagController";
import "./styles.css";
import MdEditor from "@/components/MdEditor";
import { uploadImage } from "@/api/imageController";
import { useRouter } from "next/navigation";

interface ArticleData {
  title: string;
  content: string;
  excerpt?: string;
  readTime?: number;
  coverImage?: string;
  columnIds?: number[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const ArticleCreatePage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const hasUnsavedChanges = useRef(false);

  // 监听内容变化
  useEffect(() => {
    if (title || content) {
      hasUnsavedChanges.current = true;
    }
  }, [title, content]);

  // 页面关闭确认
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "您有未保存的更改，确定要离开吗？";
        return "您有未保存的更改，确定要离开吗？";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 加载专栏数据
  const loadColumns = async () => {
    try {
      const res: any = await getColumnPage({
        current: 1,
        pageSize: 100,
      });
      if (res.code === 0) {
        setColumns(res.data?.records || []);
      }
    } catch (error) {
      console.error("加载专栏失败:", error);
    }
  };

  // 加载标签数据
  const loadTags = async () => {
    try {
      const res: any = await getTagPage({
        current: 1,
        pageSize: 100,
      });
      if (res.code === 0) {
        setTags(res.data?.records || []);
      }
    } catch (error) {
      console.error("加载标签失败:", error);
    }
  };

  useEffect(() => {
    loadColumns();
    loadTags();
  }, []);

  // 上传配置
  const uploadProps: UploadProps = {
    name: "file",
    // 使用自定义上传，将文件上传到后端接口
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file as File);
      try {
        const res: any = await uploadImage(formData);
        if (res?.code === 0) {
          // 通知 antd 上传成功，response 挂到 file.response
          onSuccess?.(res, file);
        } else {
          onError?.(new Error(res?.message || "上传失败"));
        }
      } catch (err) {
        onError?.(err as any);
      }
    },
    listType: "picture-card",
    fileList,
    maxCount: 1,
    accept: "image/*",
    onChange(info) {
      // 确保上传成功后，使用后端返回的URL作为文件的展示地址
      const newList = info.fileList.map((f) => {
        if (f.uid === info.file.uid && info.file.status === "done") {
          const url = (info.file as any).response?.data || info.file.url;
          return { ...f, url } as UploadFile<any>;
        }
        return f;
      });
      setFileList(newList);

      if (info.file.status === "done") {
        message.success(`图片上传成功`);
        form.setFieldsValue({
          coverImage: (info.file as any).response?.data || info.file.url,
        });
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    async onPreview(file) {
      let src = file.url as string | undefined;
      if (!src && file.originFileObj) {
        src = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as File);
          reader.onload = () => resolve(reader.result as string);
        });
      }
      if (src) {
        const imgWindow = window.open(src);
        if (imgWindow) {
          imgWindow.document.write(
            `<img src="${src}" style="max-width: 100%; height: auto;" />`
          );
        }
      }
    },
    onRemove() {
      form.setFieldsValue({ coverImage: undefined });
    },
  };

  // 发布文章
  const handlePublish = async (values: any) => {
    if (!title.trim()) {
      message.error("请输入文章标题");
      return;
    }
    if (!content.trim()) {
      message.error("请输入文章内容");
      return;
    }

    setLoading(true);
    try {
      const articleData: API.ArticlePublishRequest = {
        title: title.trim(),
        content: content.trim(),
        excerpt: values.excerpt?.trim(),
        coverImage: form.getFieldValue("coverImage"),
        columnIds: values.columnIds || [],
        tags: values.tags || [],
        seoTitle: values.seoTitle?.trim(),
        seoDescription: values.seoDescription?.trim(),
        seoKeywords: values.seoKeywords,
        status: 1, // 立即发布
      };

      const res: any = await publishArticle(articleData);
      if (res.code === 0) {
        message.success("文章发布成功!");
        hasUnsavedChanges.current = false;
        setSettingsVisible(false);
        // 清空表单
        setTitle("");
        setContent("");
        form.resetFields();
        setFileList([]);
        // 仅在发布成功时跳转到详情页
        if (res.data) {
          router.replace(`/article/${res.data}`);
        }
      } else {
        message.error(res.message || "发布失败");
      }
    } catch (error) {
      console.error("发布失败:", error);
      message.error("发布失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 保存草稿（status = 0）
  const handleSaveDraft = async () => {
    // 可以只做基础校验：至少填写了标题或内容之一
    if (!title.trim() && !content.trim()) {
      message.error("请至少填写标题或内容再保存草稿");
      return;
    }

    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const articleData: API.ArticlePublishRequest = {
        title: title.trim(),
        content: content.trim(),
        excerpt: values.excerpt?.trim(),
        coverImage: values.coverImage,
        columnIds: values.columnIds || [],
        tags: values.tags || [],
        seoTitle: values.seoTitle?.trim(),
        seoDescription: values.seoDescription?.trim(),
        seoKeywords: values.seoKeywords,
        status: 0, // 保存为草稿
      };

      const res: any = await publishArticle(articleData);
      if (res.code === 0) {
        message.success("草稿已保存");
        hasUnsavedChanges.current = false;
        // 草稿保存后保留当前编辑内容，方便继续编辑
      } else {
        message.error(res.message || "保存草稿失败");
      }
    } catch (error) {
      console.error("保存草稿失败:", error);
      message.error("保存草稿失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-create-container">
      {/* 顶部工具栏 */}
      <div className="create-toolbar">
        <div className="toolbar-left">
          <div className="title-section">
            <Input
              placeholder="请输入文章标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
              variant={"borderless"}
              size="large"
            />
          </div>
        </div>

        <div className="toolbar-right">
          <Space size="middle">
              <Button
                icon={<UploadOutlined />}
                onClick={ () => {
                  router.push("/admin/articles/upload");
                }}
                className="action-btn"
              >
                批量上传
              </Button>
            <Tooltip title="保存草稿">
              <Button
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                className="action-btn"
                type="text"
              >
                保存
              </Button>
            </Tooltip>

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setSettingsVisible(true)}
              className="publish-btn"
              size="large"
            >
              发布
            </Button>
          </Space>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="editor-container">
        <MdEditor value={content} onChange={setContent} />
      </div>

      {/* 发布设置抽屉 */}
      <Drawer
        title={
          <div className="drawer-title">
            <SettingOutlined />
            <span>发布设置</span>
          </div>
        }
        placement="right"
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        width={480}
        className="publish-drawer"
        footer={
          <div className="drawer-footer">
            <Button onClick={() => setSettingsVisible(false)} size="large">
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              size="large"
              icon={<SendOutlined />}
            >
              立即发布
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
          className="publish-form"
        >
          {/* 封面图片 */}
          <Form.Item
            label={
              <div className="form-label">
                <FileImageOutlined />
                <span>文章封面</span>
              </div>
            }
            name="coverImage"
          >
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div className="upload-placeholder">
                  <UploadOutlined className="upload-icon" />
                  <div className="upload-text">上传封面</div>
                  <div className="upload-hint">建议 16:9 比例</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          {/* 文章摘要 */}
          <Form.Item label="文章摘要" name="excerpt">
            <Input.TextArea
              rows={4}
              placeholder="简要描述文章内容，有助于SEO优化和读者了解..."
              maxLength={200}
              showCount
              className="excerpt-input"
            />
          </Form.Item>

          {/* 专栏选择 */}
          <Form.Item
            label={
              <div className="form-label">
                <FolderOutlined />
                <span>选择专栏</span>
              </div>
            }
            name="columnIds"
          >
            <Select
              mode="multiple"
              placeholder="选择文章所属专栏"
              options={columns.map((col) => ({
                label: col.name,
                value: col.id,
              }))}
              allowClear
              className="column-select"
            />
          </Form.Item>

          {/* 标签选择（支持额外新增） */}
          <Form.Item
            label={
              <div className="form-label">
                <TagOutlined />
                <span>文章标签</span>
              </div>
            }
            name="tags"
          >
            <Select
              mode="tags"
              placeholder="添加相关标签（可新建）"
              options={tags.map((tag) => ({
                label: tag.name,
                value: tag.name,
              }))}
              allowClear
              className="tag-select"
            />
          </Form.Item>

          {/* SEO设置 */}
          <div className="seo-section">
            <div className="section-title">
              <SearchOutlined />
              <span>SEO 优化</span>
            </div>

            <Form.Item label="SEO 标题" name="seoTitle">
              <Input
                placeholder="搜索引擎显示的标题（留空使用文章标题）"
                maxLength={60}
              />
            </Form.Item>

            <Form.Item label="SEO 描述" name="seoDescription">
              <Input.TextArea
                rows={3}
                placeholder="搜索引擎显示的描述（留空使用文章摘要）"
                maxLength={160}
                showCount
              />
            </Form.Item>

            <Form.Item label="SEO 关键词" name="seoKeywords">
            <Select
              mode="tags"
              placeholder="请选择或输入关键词"
            />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ArticleCreatePage;
