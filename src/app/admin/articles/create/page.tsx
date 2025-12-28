"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import {
  Alert,
  Button,
  Drawer,
  FloatButton,
  Form,
  Input,
  Modal,
  Table,
  message,
  Select,
  Space,
  Tooltip,
  Upload,
} from "antd";
import type { TableProps } from "antd";

import {
  FileImageOutlined,
  FolderOutlined,
  SaveOutlined,
  SendOutlined,
  SettingOutlined,
  TagOutlined,
  UploadOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";
import {
  getArticlePage,
  getArticleVoById,
  publishArticle,
  updateArticle,
} from "@/api/articleController";
import { getColumnPage } from "@/api/columnController";
import { getTagPage } from "@/api/tagController";
import "./styles.css";
import MdEditor from "@/components/MdEditor";
import { uploadImage } from "@/api/imageController";
import { useRouter } from "next/navigation";

const ArticleStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
} as const;

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
  const [draftCount, setDraftCount] = useState(0);
  const [draftModalVisible, setDraftModalVisible] = useState(false);
  const [draftModalLoading, setDraftModalLoading] = useState(false);
  const [drafts, setDrafts] = useState<API.ArticleVo[]>([]);
  const [draftsInitialized, setDraftsInitialized] = useState(false);
  const [draftPagination, setDraftPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [editingArticleId, setEditingArticleId] = useState<number>();
  const hasUnsavedChanges = useRef(false);
  const [draftAlertVisible, setDraftAlertVisible] = useState(true);
  const draftsLoadingRef = useRef(false);
  const metaLoadedRef = useRef(false);
  const initialDraftsLoadedRef = useRef(false);

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
    if (metaLoadedRef.current) {
      return;
    }
    metaLoadedRef.current = true;
    loadColumns();
    loadTags();
  }, []);

  const loadDrafts = async (
    page = 1,
    pageSize = draftPagination.pageSize,
    options?: { silent?: boolean }
  ) => {
    const silent = options?.silent;
    if (!silent) {
      setDraftModalLoading(true);
    }
    draftsLoadingRef.current = true;
    try {
      const res: any = await getArticlePage({
        current: page,
        pageSize,
        status: ArticleStatus.DRAFT,
      });
      if (res.code === 0) {
        setDrafts(res.data?.records || []);
        setDraftPagination({
          current: res.data?.current || page,
          pageSize: res.data?.size || pageSize,
          total: res.data?.total || 0,
        });
        setDraftCount(res.data?.total || 0);
        setDraftsInitialized(true);
      }
    } catch (error) {
      console.error("加载草稿列表失败:", error);
      message.error("加载草稿列表失败，请稍后重试");
    } finally {
      draftsLoadingRef.current = false;
      if (!silent) {
        setDraftModalLoading(false);
      }
    }
  };

  useEffect(() => {
    if (initialDraftsLoadedRef.current) {
      return;
    }
    initialDraftsLoadedRef.current = true;
    // 初始化草稿信息（列表 + 统计），避免重复分页请求
    void loadDrafts(1, draftPagination.pageSize, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDraftModal = async () => {
    setDraftModalVisible(true);
    if (!draftsInitialized && !draftsLoadingRef.current) {
      await loadDrafts();
    }
  };

  const parseToStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return (value as unknown[])
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
    return [];
  };

  const handleEditDraft = async (articleId: number) => {
    const hide = message.loading({
      content: "正在加载草稿...",
      key: "load-draft",
      duration: 0,
    });
    let succeeded = false;
    try {
      const res: any = await getArticleVoById({ articleId });
      if (res.code === 0 && res.data) {
        const article = res.data;
        setEditingArticleId(article.id);
        setTitle(article.title || "");
        setContent(article.content || "");
        const columnIds =
          Array.isArray(article.columns) && article.columns.length > 0
            ? article.columns
                .map((col) => col?.id)
                .filter((id): id is number => typeof id === "number")
            : undefined;
        const tagsArray = parseToStringArray(article.tags);
        form.setFieldsValue({
          excerpt: article.excerpt || undefined,
          columnIds: columnIds || [],
          tags: tagsArray,
          coverImage: article.coverImage || undefined,
        });
        if (article.coverImage) {
          setFileList([
            {
              uid: "existing-cover",
              name: "封面图",
              status: "done",
              url: article.coverImage,
            } as UploadFile,
          ]);
        } else {
          setFileList([]);
        }
        hasUnsavedChanges.current = false;
        setDraftModalVisible(false);
        message.success({
          content: "草稿已加载，您可以继续编辑。",
          key: "load-draft",
        });
        succeeded = true;
      } else {
        message.error(res.message || "加载草稿失败");
      }
    } catch (error) {
      console.error("加载草稿详情失败:", error);
      message.error("加载草稿详情失败，请稍后重试");
    } finally {
      if (!succeeded) {
        hide();
      }
    }
  };

  const draftColumns: TableProps<API.ArticleVo>["columns"] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (value: string) => value || "-",
    },
    {
      title: "最后更新",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 180,
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: (_: unknown, record: API.ArticleVo) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            if (record.id) {
              handleEditDraft(record.id);
            }
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

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
      hasUnsavedChanges.current = true;

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
      hasUnsavedChanges.current = true;
    },
  };

  const buildArticlePayload = (
    status: number,
    formValues: any
  ): API.ArticleDto => {
    const coverImage =
      formValues.coverImage || form.getFieldValue("coverImage");
    const normalizedCoverImage =
      typeof coverImage === "string" && coverImage.trim().length > 0
        ? coverImage.trim()
        : undefined;
    const columnIds = Array.isArray(formValues.columnIds)
      ? formValues.columnIds.filter(
          (id: number | null | undefined) => id !== null && id !== undefined
        )
      : [];
    const tags = Array.isArray(formValues.tags)
      ? (formValues.tags
          .map((tag: string) => tag?.trim())
          .filter((tag: string | undefined) => !!tag) as string[])
      : [];
    const sanitized: API.ArticleDto = {
      status,
      title: title.trim() || undefined,
      content: content.trim() || undefined,
      excerpt: formValues.excerpt?.trim() || undefined,
      coverImage: normalizedCoverImage,
      columnIds: columnIds.length > 0 ? columnIds : undefined,
      tags: tags.length > 0 ? tags : undefined,
      id: editingArticleId,
    };
    return sanitized;
  };

  const resetEditorState = () => {
    setTitle("");
    setContent("");
    form.resetFields();
    setFileList([]);
    setEditingArticleId(undefined);
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
    if (!form.getFieldValue("coverImage")) {
      message.error("请上传文章封面");
      return;
    }
    // if (!values.columnIds || values.columnIds.length === 0) {
    //   message.error("请至少选择一个专栏");
    //   return;
    // }
    // if (!values.tags || values.tags.length === 0) {
    //   message.error("请至少添加一个标签");
    //   return;
    // }

    setLoading(true);
    try {
      const payload = buildArticlePayload(ArticleStatus.PUBLISHED, values);
      const isEditing = typeof editingArticleId === "number";
      const res: any = isEditing
        ? await updateArticle(payload)
        : await publishArticle(payload);
      if (res.code === 0) {
        message.success(isEditing ? "文章更新成功!" : "文章发布成功!");
        hasUnsavedChanges.current = false;
        setSettingsVisible(false);
        const targetId =
          isEditing && editingArticleId ? editingArticleId : res.data;
        resetEditorState();
        if (targetId) {
          router.replace(`/article/${targetId}`);
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
    if (!title.trim() && !content.trim()) {
      message.error("请至少填写标题或内容再保存草稿");
      return;
    }

    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const payload = buildArticlePayload(ArticleStatus.DRAFT, values);
      const isEditing = typeof editingArticleId === "number";
      const res: any = isEditing
        ? await updateArticle(payload)
        : await publishArticle(payload);
      if (res.code === 0) {
        if (!isEditing && res.data) {
          setEditingArticleId(res.data);
        }
        message.success(isEditing ? "草稿已更新" : "草稿已保存");
        hasUnsavedChanges.current = false;
        await loadDrafts(
          draftPagination.current,
          draftPagination.pageSize,
          { silent: !draftModalVisible }
        );
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
      {draftCount > 0 && draftAlertVisible && (
        <div className="draft-bubble">
          <div className="draft-bubble-content">
            <span className="draft-bubble-text">
              你有 {draftCount} 篇草稿待处理
            </span>
            <Button
              type="link"
              onClick={handleOpenDraftModal}
              size="small"
              className="draft-bubble-btn"
            >
              查看草稿
            </Button>
            <button
              className="draft-bubble-close"
              onClick={() => setDraftAlertVisible(false)}
              aria-label="关闭提示"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* 顶部工具栏 */}
      <div className="create-toolbar">
        <div className="toolbar-left">
          <div className="title-section">
            <Input
              placeholder="请输入文章标题..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                hasUnsavedChanges.current = true;
              }}
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
              onClick={() => {
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
        <div className="editor-shell">
          <MdEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              hasUnsavedChanges.current = true;
            }}
          />
        </div>
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
          onValuesChange={() => {
            hasUnsavedChanges.current = true;
          }}
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

        </Form>
      </Drawer>

      <Modal
        title="草稿列表"
        open={draftModalVisible}
        onCancel={() => setDraftModalVisible(false)}
        footer={null}
        width={720}
        destroyOnHidden
        className="draft-modal"
        rootClassName="draft-modal-root"
      >
        <div className="draft-modal-body">
          <Table
            columns={draftColumns}
            dataSource={drafts}
            loading={draftModalLoading}
            pagination={{
              current: draftPagination.current,
              pageSize: draftPagination.pageSize,
              total: draftPagination.total,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                loadDrafts(page, pageSize);
              },
            }}
            rowKey="id"
            className="draft-table"
          />
        </div>
      </Modal>
      <FloatButton.BackTop
        visibilityHeight={200}
        icon={<VerticalAlignTopOutlined />}
        className="back-top-button"
        type="default"
        shape="circle"
      />
    </div>
  );
};

export default ArticleCreatePage;
