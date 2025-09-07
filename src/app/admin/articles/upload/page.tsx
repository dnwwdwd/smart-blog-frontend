"use client";

import React, { useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Modal, Space, Typography, Upload, message } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { InboxOutlined, DeleteOutlined, FileMarkdownOutlined, ImportOutlined, EyeOutlined } from "@ant-design/icons";
import { batchUploadArticles } from "@/api/articleController";
import './styles.css'

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

// 预览模态框内容组件
const PreviewContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="preview-content">
      <code>{content}</code>
    </div>
  );
};

const BulkMarkdownUploadPage: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const contentMap = useRef<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<Record<string, { status: "pending" | "success" | "error"; message?: string; articleId?: number }>>({});

  const mdAccept = useMemo(() => ".md,text/markdown", []);

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isMd = file.name.toLowerCase().endsWith(".md") || file.type === "text/markdown";
    if (!isMd) {
      message.error("仅支持上传 .md 格式的 Markdown 文件");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    accept: mdAccept,
    fileList,
    beforeUpload,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError, onProgress } = options;
      try {
        // 模拟上传进度 + 读取文件内容
        let percent = 0;
        const timer = setInterval(() => {
          percent = Math.min(percent + 20, 90);
          onProgress?.({ percent });
        }, 120);

        const text = await file.text();
        contentMap.current[file.uid] = text;

        clearInterval(timer);
        onProgress?.({ percent: 100 });
        onSuccess?.({ code: 0, message: "ok" }, file);
      } catch (e) {
        onError?.(e);
      }
    },
    onChange(info) {
      setFileList(info.fileList);
    },
    onRemove(file) {
      const map = contentMap.current;
      if (map[file.uid]) delete map[file.uid];
      const statusMap = { ...importStatus };
      if (statusMap[file.uid]) delete statusMap[file.uid];
      setImportStatus(statusMap);
    },
    onPreview: async (file) => {
      // 优先从内存中读取已解析的内容
      let text = contentMap.current[file.uid];
      if (!text && file.originFileObj) {
        text = await file.originFileObj.text();
      }
      setPreviewText(text || "(空文件)");
      setPreviewOpen(true);
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    itemRender(originNode, file) {
      const status = importStatus[file.uid];
      return (
        <div className="bulk-file-item">
          <div className="bulk-file-meta">
            <FileMarkdownOutlined />
            <span>{file.name}</span>
          </div>
          <div className="bulk-file-status">
            {status?.status === "success" && <Text type="success">导入成功{status.articleId ? `（ID: ${status.articleId}）` : ""}</Text>}
            {status?.status === "error" && <Text type="danger">{status.message || "导入失败"}</Text>}
            {originNode}
          </div>
        </div>
      );
    },
  };

  const clearAll = () => {
    setFileList([]);
    contentMap.current = {};
    setImportStatus({});
  };

  const handleBatchUpload = async () => {
    if (!fileList.length) {
      message.warning("请先选择要上传的 Markdown 文件");
      return;
    }
    
    setImporting(true);
    const newStatus: typeof importStatus = { ...importStatus };

    try {
      // 获取所有文件的原始文件对象
      const files = fileList
        .filter(file => file.originFileObj)
        .map(file => file.originFileObj as File);
      
      if (files.length === 0) {
        message.error("没有有效的文件可上传");
        return;
      }

      const res: any = await batchUploadArticles(files);
      
      if (res?.code === 0) {
        message.success("文件上传成功");
        // 标记所有文件为成功状态
        fileList.forEach(file => {
          newStatus[file.uid] = { status: "success", message: "上传成功" };
        });
      } else {
        message.error(res?.message || "上传失败");
        // 标记所有文件为失败状态
        fileList.forEach(file => {
          newStatus[file.uid] = { status: "error", message: res?.message || "上传失败" };
        });
      }
    } catch (e: any) {
      message.error(e?.message || "上传异常");
      // 标记所有文件为失败状态
      fileList.forEach(file => {
        newStatus[file.uid] = { status: "error", message: e?.message || "上传异常" };
      });
    } finally {
      setImportStatus({ ...newStatus });
      setImporting(false);
    }
  };

  return (
    <div className="bulk-upload-page">
      <Space direction="vertical" size={16} className="bulk-page-space">
        <Card>
          <div className="bulk-header">
            <Title level={3} className="bulk-title">文章批量上传</Title>
            <Paragraph type="secondary" className="bulk-subtitle">
              仅支持 .md 格式的 Markdown 文件。你可以拖拽文件到下方区域，或点击选择文件，支持多文件批量上传。
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            message="操作指引"
            description={
              <div>
                <div>1) 将 Markdown 文件拖入上传区域或点击选择文件</div>
                <div>2) 预览文件内容，确认无误后点击下方按钮导入</div>
                <div>3) 导入结果会显示在文件列表右侧，失败会提示详细原因</div>
              </div>
            }
          />

          <Card className="bulk-card">
            <Dragger {...uploadProps} className="bulk-dragger">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 Markdown 文件到此区域进行上传</p>
              <p className="ant-upload-hint">支持批量选择，仅限 .md 文件，大小请控制在合理范围内</p>
            </Dragger>

            <div className="bulk-actions">
              <Space>
                <Button icon={<DeleteOutlined />} danger onClick={clearAll} disabled={!fileList.length}>
                  清空列表
                </Button>
              </Space>
              <Space>
                <Button type="primary" icon={<ImportOutlined />} loading={importing} onClick={handleBatchUpload} disabled={!fileList.length}>
                  上传
                </Button>
              </Space>
            </div>
          </Card>
        </Card>

      </Space>

      <Modal
        open={previewOpen}
        title="Markdown 预览"
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={760}
      >
        <PreviewContent content={previewText} />
      </Modal>
    </div>
  );
};

export default BulkMarkdownUploadPage;