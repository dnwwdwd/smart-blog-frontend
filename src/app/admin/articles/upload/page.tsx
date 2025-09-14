"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Modal, Space, Typography, Upload, message, Table, Tag, Tooltip } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { InboxOutlined, DeleteOutlined, FileMarkdownOutlined, ImportOutlined, ReloadOutlined } from "@ant-design/icons";
import { batchUpload, getUploadStatuses, retryUpload } from "@/api/articleController";
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
  const [idMap, setIdMap] = useState<Record<string, number>>({}); // file.uid -> articleId
  const pollTimer = useRef<any>(null);
  const idMapRef = useRef<Record<string, number>>({});
  const pollingInFlight = useRef<boolean>(false);

  useEffect(() => {
    idMapRef.current = idMap;
  }, [idMap]);
  const mdAccept = useMemo(() => ".md,text/markdown", []);

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, []);

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
      const nextIdMap = { ...idMap };
      if (nextIdMap[file.uid]) delete nextIdMap[file.uid];
      setIdMap(nextIdMap);
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
    showUploadList: false,
    // 移除自定义 itemRender，统一由下方表格展示文件与状态
    itemRender(originNode, file) {
      const status = importStatus[file.uid];
      const isPending = status?.status === "pending";
      const isSuccess = status?.status === "success";
      const isError = status?.status === "error";
      return (
        <div className="bulk-file-item">
          <div className="bulk-file-meta">
            <FileMarkdownOutlined />
            <span>{file.name}</span>
          </div>
          <div className="bulk-file-status">
            {isPending && <Text>处理中...</Text>}
            {isSuccess && <Text type="success">导入成功{status.articleId ? `（ID: ${status.articleId}）` : ""}</Text>}
            {isError && (
              <Space>
                <Text type="danger">{status.message || "导入失败"}</Text>
                {idMap[file.uid] && (
                  <Button size="small" icon={<ReloadOutlined />} onClick={() => handleRetry(file.uid)}>重试</Button>
                )}
              </Space>
            )}
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
    setIdMap({});
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  // 通过 uid 预览文件内容（读取缓存的 contentMap）
  const previewFileByUid = (uid: string) => {
    const text = contentMap.current[uid];
    if (!text) {
      message.warning("未读取到文件内容");
      return;
    }
    setPreviewText(text);
    setPreviewOpen(true);
  };

  // 通过 uid 移除文件，并同步清理相关状态
  const removeFileByUid = (uid: string) => {
    setFileList((prev) => prev.filter((f) => f.uid !== uid));
    // 清理内容缓存
    if (contentMap.current[uid]) delete contentMap.current[uid];
    // 清理状态与映射
    setImportStatus((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    setIdMap((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
  };

  const startPolling = (ids: number[]) => {
    const hasAny = (ids && ids.length) || Object.values(idMapRef.current).length;
    if (!hasAny) return;
    if (pollTimer.current) return; // 已在轮询中

    pollTimer.current = setInterval(async () => {
      if (pollingInFlight.current) return;
      pollingInFlight.current = true;
      try {
        const currentIds = Array.from(new Set(Object.values(idMapRef.current)));
        if (!currentIds.length) {
          clearInterval(pollTimer.current);
          pollTimer.current = null;
          pollingInFlight.current = false;
          return;
        }
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[upload-poll] tick', new Date().toISOString(), 'ids=', currentIds);
        }
        const res = await getUploadStatuses(currentIds);
        const body = res as any;
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[upload-poll] resp', body);
        }
        if (body?.code !== 0) return;
        const data = (body?.data || {}) as Record<number, number>;
        setImportStatus((prev) => {
          const next = { ...prev };
          // 0: uploading, 1: success, 2: failed
          const idToUid: Record<number, string> = {};
          Object.entries(idMapRef.current).forEach(([uid, aid]) => { idToUid[aid] = uid; });
          let hasUploading = false;
          Object.entries(data).forEach(([idStr, code]) => {
            const id = Number(idStr);
            const uid = idToUid[id];
            if (!uid) return;
            if (code === 0) {
              hasUploading = true;
              next[uid] = { status: 'pending', articleId: id };
            } else if (code === 1) {
              next[uid] = { status: 'success', articleId: id };
            } else if (code === 2) {
              next[uid] = { status: 'error', articleId: id };
            }
          });
          if (!hasUploading) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('[upload-poll] complete, stop polling');
            }
            clearInterval(pollTimer.current);
            pollTimer.current = null;
          }
          return next;
        });
      } catch (e) {
        // 忽略瞬时错误，稍后继续
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[upload-poll] error', e);
        }
      } finally {
        pollingInFlight.current = false;
      }
    }, 1500);
  };

  const handleBatchUpload = async () => {
    if (!fileList.length) {
      message.warning("请先选择要上传的 Markdown 文件");
      return;
    }
    
    setImporting(true);
    const newStatus: typeof importStatus = { ...importStatus };

    try {
      const validFiles = fileList
        .filter(file => file.originFileObj)
        .map(file => file as UploadFile & { originFileObj: File });
      const files = validFiles.map(f => f.originFileObj as File);
      
      if (files.length === 0) {
        message.error("没有有效的文件可上传");
        return;
      }

      const res = await batchUpload(files);
      const body = res as any;
      
      if (body?.code === 0) {
        const ids: number[] = body?.data || [];
        if (!Array.isArray(ids) || ids.length !== validFiles.length) {
          message.warning("返回的占位文章ID数量与文件数量不一致，将按最短长度匹配");
        }
        const map: Record<string, number> = {};
        const minLen = Math.min(ids.length, validFiles.length);
        for (let i = 0; i < minLen; i++) {
          const uid = validFiles[i].uid;
          const id = ids[i];
          map[uid] = id;
          newStatus[uid] = { status: "pending", articleId: id };
        }
        setIdMap(map);
        setImportStatus({ ...newStatus });
        message.success("已提交处理，开始轮询状态...");
        startPolling(Object.values(map));
      } else {
        message.error(body?.message || "上传失败");
        fileList.forEach(file => {
          newStatus[file.uid] = { status: "error", message: body?.message || "上传失败" };
        });
        setImportStatus({ ...newStatus });
      }
    } catch (e: any) {
      message.error(e?.message || "上传异常");
      fileList.forEach(file => {
        newStatus[file.uid] = { status: "error", message: e?.message || "上传异常" };
      });
      setImportStatus({ ...newStatus });
    } finally {
      setImporting(false);
    }
  };

  const handleRetry = async (uid: string) => {
    const id = idMap[uid];
    if (!id) {
      message.error("未找到对应的文章ID，无法重试");
      return;
    }
    try {
      const res = await retryUpload(id);
      const body = res as any;
      if (body?.code === 0) {
        setImportStatus((prev) => ({ ...prev, [uid]: { status: "pending", articleId: id } }));
        if (!pollTimer.current) {
          const ids = Array.from(new Set(Object.values(idMap)));
          startPolling(ids);
        }
        message.success("已触发重试");
      } else {
        message.error(body?.message || "重试失败");
      }
    } catch (e: any) {
      message.error(e?.message || "重试异常");
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
                <div>3) 导入结果会显示在表格中，失败可点击重试继续处理</div>
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

            {/* 表格视图 */}
            <div className="bulk-table-wrapper">
              <Table
                size="middle"
                rowKey={(record) => record.uid}
                pagination={false}
                dataSource={fileList.map((f) => ({
                  uid: f.uid,
                  name: f.name,
                  articleId: idMap[f.uid],
                  status: importStatus[f.uid]?.status || 'pending',
                }))}
                columns={[
                  {
                    title: '文件名',
                    dataIndex: 'name',
                    key: 'name',
                    align: 'center',
                    width: 360,
                    ellipsis: true,
                    render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
                  },
                  {
                    title: '文章ID',
                    dataIndex: 'articleId',
                    key: 'articleId',
                    align: 'center',
                    width: 180,
                    render: (id?: number) => id ? <Tag color="blue">{id}</Tag> : <Tag>待生成</Tag>,
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    align: 'center',
                    width: 140,
                    render: (s: 'pending' | 'success' | 'error') => {
                      if (s === 'pending') return <Tag color="processing">处理中</Tag>;
                      if (s === 'success') return <Tag color="success">成功</Tag>;
                      if (s === 'error') return <Tag color="error">失败</Tag>;
                      return <Tag>未知</Tag>;
                    }
                  },
                  {
                    title: '操作',
                    key: 'action',
                    align: 'center',
                    width: 260,
                    render: (_: any, record: { uid: string; name: string }) => {
                      const status = importStatus[record.uid]?.status;
                      const aid = idMap[record.uid];
                      return (
                        <Space wrap>
                          <Button size="small" onClick={() => previewFileByUid(record.uid)}>预览</Button>
                          {status === 'error' && aid && (
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => handleRetry(record.uid)}>重试</Button>
                          )}
                          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeFileByUid(record.uid)}>移除</Button>
                        </Space>
                      );
                    }
                  }
                ]}
                locale={{ emptyText: '暂无文件，请先选择或拖拽上传 Markdown 文件' }}
              />
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