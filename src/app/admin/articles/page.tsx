"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import locale from "antd/locale/zh_CN";
import type { UploadFile, UploadProps } from "antd";
import {
  Button,
  Card,
  ConfigProvider,
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
  Tooltip,
  Upload,
  DatePicker,
} from "antd";

dayjs.locale("zh-cn");
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";
import {
  getAllArticles,
  getArticleVoById,
  updateArticle,
  deleteArticle,
} from "@/api/articleController";
import { formatDate } from "@/utils";
import { getColumnPage } from "@/api/columnController";
import { getTagPage } from "@/api/tagController";
import { uploadImage } from "@/api/imageController";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Article {
  key: string;
  id: number;
  title: string;
  author: string;
  category: string;
  tags: string[];
  status: number;
  publishDate: string;
  views: number;
  likes: number;
  excerpt: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const ArticleManagement: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<number>();
  const [columnFilter, setColumnFilter] = useState<number>();
  const [tagFilter, setTagFilter] = useState<number>();
  const [publishRange, setPublishRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  // 分页状态
  const [pageCurrent, setPageCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const filtersInitialized = useRef(false);

  // 上传配置
  const uploadProps: UploadProps = {
    name: "file",
    // 使用自定义上传到后端
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;
      const formData = new FormData();
      formData.append("file", file as File);
      try {
        const res: any = await uploadImage(formData);
        if (res?.code === 0) {
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
      // 同步url，保证预览可用
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
        // 更新表单中的coverImage字段
        form.setFieldsValue({
          coverImage: (info.file as any).response?.data || info.file.url,
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
        imgWindow.document.write(
          `<img src="${src}" style="max-width: 100%; height: auto;" />`
        );
      }
    },
    onRemove: () => {
      form.setFieldsValue({ coverImage: undefined });
    },
  };

  const buildArticleRequest = useCallback((current: number, size: number): API.ArticleRequest => {
    const payload: API.ArticleRequest = {
      current,
      pageSize: size,
      keyword: searchText.trim() || undefined,
    };
    if (typeof statusFilter !== "undefined") {
      payload.status = statusFilter;
    }
    if (typeof columnFilter !== "undefined") {
      payload.columnId = columnFilter;
    }
    if (typeof tagFilter !== "undefined") {
      payload.tagId = tagFilter;
    }
    if (publishRange && publishRange[0] && publishRange[1]) {
      payload.publishStartTime = publishRange[0].startOf("day").valueOf();
      payload.publishEndTime = publishRange[1].endOf("day").valueOf();
    }
    return payload;
  }, [searchText, statusFilter, columnFilter, tagFilter, publishRange]);

  const getArticles = useCallback(async (current: number, size: number) => {
    setLoading(true);
    try {
      const params = buildArticleRequest(current, size);
      const res = (await getAllArticles(params)) as any;
      setArticles(res?.data?.records || []);
      setTotal(res?.data?.total || 0);
      setPageCurrent(current);
      setPageSize(size);
    } catch (error) {
      console.error("获取文章列表失败", error);
      message.error("获取文章列表失败");
    } finally {
      setLoading(false);
    }
  }, [buildArticleRequest]);

  useEffect(() => {
    (async () => {
      await getArticles(1, pageSize);
      filtersInitialized.current = true;
    })();
  }, [getArticles, pageSize]);

  useEffect(() => {
    if (!filtersInitialized.current) {
      return;
    }
    const handler = setTimeout(() => {
      getArticles(1, pageSize);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchText, statusFilter, columnFilter, tagFilter, publishRange, getArticles, pageSize]);

  useEffect(() => {
    // 加载专栏与标签
    (async () => {
      try {
        const [colResRaw, tagResRaw] = await Promise.all([
          getColumnPage({ current: 1, pageSize: 100 }),
          getTagPage({ current: 1, pageSize: 100 }),
        ]);
        const colRes: any = colResRaw as any;
        const tagRes: any = tagResRaw as any;
        if (colRes?.code === 0) setColumns(colRes.data?.records || []);
        if (tagRes?.code === 0) setTags(tagRes.data?.records || []);
      } catch (err) {
        console.warn("加载专栏或标签失败", err);
      }
    })();
  }, []);

  const handleEdit = (record: Article) => {
    setEditingArticle(record);

    // 处理SEO关键词字段，将JSON字符串解析为数组
    const formValues = {
      ...record,
      publishDate: record.publishDate,
    };

    form.setFieldsValue(formValues);

    // 设置现有封面图片到文件列表
    if (record.coverImage) {
      setFileList([
        {
          uid: "-1",
          name: "cover.jpg",
          status: "done",
          url: record.coverImage,
        },
      ]);
    } else {
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    // 检查id是否有效
    if (!id || id <= 0) {
      message.error("无效的文章ID");
      return;
    }
    
    try {
      setLoading(true);
      const res: any = await deleteArticle(id);
      if (res?.code === 0) {
        message.success("文章删除成功");
        await getArticles(pageCurrent, pageSize);
      } else {
        message.error(res?.message || "文章删除失败");
      }
    } catch (e: any) {
      message.error(e?.message || "文章删除失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 下载 Markdown：优先使用当前列表项的 content，否则拉取详情
  const handleDownload = async (record: Article) => {
    try {
      let content: string | undefined = (record as any).content;
      if (!content) {
        const res: any = await getArticleVoById({ articleId: record.id });
        if (res?.code === 0) {
          content = res?.data?.content || res?.data?.markdown || res?.data?.md || "";
        }
      }
      if (!content) {
        message.warning("未获取到文章内容，无法导出");
        return;
      }
      const title = record.title || `article-${record.id}`;
      const safeName = title.replace(/[\\/:*?"<>|\n\r]+/g, "-").slice(0, 80);
      const filename = `${safeName || "article"}.md`;
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success(`已下载：${filename}`);
    } catch (e: any) {
      message.error(e?.message || "下载失败，请重试");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 处理字段，确保以List类型传递给后端
      const processedValues = {
        ...values,
        columnIds: values.columnIds || [],
        tags: values.tags || [],
        seoKeywords: values.seoKeywords || [],
      };

      if (editingArticle) {
        // 编辑文章 - 调用后端接口
        const response = (await updateArticle({
          ...processedValues,
          id: editingArticle.id,
        })) as any;

        if (response.code === 0) {
          // 更新前端状态
          setArticles(
            articles.map((article) =>
              article.id === editingArticle.id
                ? { ...article, ...processedValues, key: article.key }
                : article
            )
          );
          message.success("文章更新成功");
        } else {
          message.error(response.message || "文章更新失败");
        }
      } else {
        // 新增文章
        const newArticle: Article = {
          ...processedValues,
          key: Date.now().toString(),
          id: Date.now(),
          views: 0,
          likes: 0,
        } as Article;
        setArticles([newArticle, ...articles]);
        message.success("文章创建成功");
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("保存文章失败", error);
      message.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setColumnFilter(undefined);
    setTagFilter(undefined);
    setPublishRange(null);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="blue">草稿</Tag>;
      case 1:
        return <Tag color="green">已发布</Tag>;
      case 2:
        return <Tag color="volcano">已归档</Tag>;
      default:
        return "无";
    }
  };

  // 使用服务端分页后，前端不再二次过滤，直接使用 articles

  const columnsDef: ColumnsType<Article> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "封面",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 80,
      render: (coverImage?: string) => {
        const normalized = coverImage?.trim();
        if (!normalized) {
          return (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: 12,
              }}
            >
              无
            </div>
          );
        }
        return (
          <Image
            src={normalized}
            alt="封面"
            width={40}
            height={40}
          />
        );
      },
    },
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 180,
      ellipsis: true,
      render: (text: string, record: Article) => (
        <Tooltip title={text}>
          <a onClick={() => handleEdit(record)}>{text}</a>
        </Tooltip>
      ),
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      width: 200,
      ellipsis: true,
    },
    {
      title: "摘要",
      dataIndex: "excerpt",
      key: "excerpt",
      width: 180,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>{text}</Tooltip>
      ),
    },
    {
      title: "标签",
      dataIndex: "tags",
      key: "tags",
      width: 100,
      render: (tags: string[]) => (
        <>
          {tags &&
            tags.map((tag) => (
              <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                {tag}
              </Tag>
            ))}
        </>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => getStatusText(status),
      filters: [
        { text: "草稿", value: "0" },
        { text: "已发布", value: "1" },
        { text: "已归档", value: "2" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "发布日期",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: "浏览量",
      dataIndex: "views",
      key: "views",
      width: 100,
      sorter: (a, b) => a.views - b.views,
      render: (views: number) => views.toLocaleString(),
    },
    {
      title: "预计阅读时间",
      dataIndex: "readTime",
      key: "readTime",
      width: 100,
      render: (readTime: number) => `${readTime} 分钟`,
    },
    {
      title: "操作",
      key: "action",
      width: 400,
      align: 'center',
      fixed: "right",
      render: (_, record: Article) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => window.open(`/article/${record.id}`, "_blank")}
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
          <Button
            type="link"
            size="small"
            onClick={() => handleDownload(record)}
          >
            下载MD
          </Button>
          <Popconfirm
            title="确定要删除这篇文章吗？"
            onConfirm={() => {
              console.log(record)
              // 确保传入有效的ID
              if (record.id) {
                handleDelete(record.id);
              } else {
                message.error("无效的文章ID");
              }
            }}
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
          <div className="filters-row">
            <Input.Search
              placeholder="搜索文章标题 / 摘要"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
            <Select
              placeholder="筛选状态"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 140 }}
              allowClear
            >
              <Option value={0}>草稿</Option>
              <Option value={1}>已发布</Option>
              <Option value={2}>已归档</Option>
            </Select>
            <Select
              placeholder="所属专栏"
              value={columnFilter}
              onChange={(value) => setColumnFilter(value)}
              allowClear
              style={{ width: 180 }}
              options={columns.map((col) => ({
                label: col.name,
                value: col.id,
              }))}
            />
            <Select
              placeholder="标签"
              value={tagFilter}
              onChange={(value) => setTagFilter(value)}
              allowClear
              style={{ width: 160 }}
              options={tags.map((tag) => ({
                label: tag.name,
                value: tag.id,
              }))}
            />
            <ConfigProvider locale={locale}>
              <RangePicker
                value={publishRange || undefined}
                onChange={(values) => {
                  if (values && values[0] && values[1]) {
                    setPublishRange([values[0], values[1]] as [Dayjs, Dayjs]);
                  } else {
                    setPublishRange(null);
                  }
                }}
                placeholder={["开始日期", "结束日期"]}
                allowClear
                style={{ width: 240 }}
              />
            </ConfigProvider>
            <Button onClick={handleResetFilters} type="default">
              重置筛选
            </Button>
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columnsDef}
          dataSource={articles}
          loading={loading}
          pagination={{
            total,
            current: pageCurrent,
            pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t, range) => `第 ${range[0]}-${range[1]} 条，共 ${t} 条`,
          }}
          onChange={(pagination) => {
            const nextCurrent = pagination.current || 1;
            const nextSize = pagination.pageSize || pageSize;
            getArticles(nextCurrent, nextSize);
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingArticle ? "编辑文章" : "新建文章"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        className="article-modal"
        maskClosable={false}
        zIndex={2000}
        footer={
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              onClick={() => form.submit()}
            >
              {editingArticle ? "更新" : "创建"}
            </Button>
            <Button onClick={() => setModalVisible(false)}>取消</Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "0",
          }}
        >
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>

          {/* 专栏（来自后端） */}
          <Form.Item name="columnIds" label="选择专栏">
            <Select
              mode="multiple"
              placeholder="选择文章所属专栏（可选）"
              options={columns.map((col) => ({
                label: col.name,
                value: col.id,
              }))}
              allowClear
            />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="请选择或输入标签（可选）"
              options={tags.map((t) => ({ value: t.name, label: t.name }))}
            />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="文章摘要"
          >
            <TextArea
              rows={3}
              placeholder="请输入文章摘要"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="coverImage"
            label="封面图片"
            extra="建议尺寸：800x400px，支持 jpg、png 格式，最多上传1张"
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

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select placeholder="请选择状态">
              <Option value="0">草稿</Option>
              <Option value="1">已发布</Option>
              <Option value="2">已归档</Option>
            </Select>
          </Form.Item>

          {/* SEO字段 */}
          <Form.Item name="seoTitle" label="SEO标题">
            <Input placeholder="请输入SEO标题（可选）" />
          </Form.Item>

          <Form.Item name="seoDescription" label="SEO描述">
            <TextArea
              rows={2}
              placeholder="请输入SEO描述（可选）"
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item name="seoKeywords" label="SEO关键词">
            <Select
              mode="tags"
              placeholder="请输入SEO关键词（可选）"
              tokenSeparators={[",", "，"]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArticleManagement;
