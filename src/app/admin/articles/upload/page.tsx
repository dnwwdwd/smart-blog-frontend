"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Card,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  DeleteOutlined,
  FileMarkdownOutlined,
  ImportOutlined,
  InboxOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { batchUpload } from "@/api/articleController";
import { apiClientBaseUrl } from "../../../../../config/apiConfig";
import "./styles.css";

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

type UploadPhase =
  | "idle"
  | "queued"
  | "uploading"
  | "processing"
  | "success"
  | "failed";

interface UploadItemState {
  status: UploadPhase;
  message?: string;
  articleId?: number;
  batchId?: string;
}

interface SseFilePayload {
  batchId?: string;
  articleId?: number;
  order?: number;
  fileName?: string;
  status?: string;
  message?: string;
}

interface SseBatchPayload {
  batchId?: string;
  status?: string;
  message?: string;
}

type MarkdownUploadFile = UploadFile & { originFileObj?: File };

const MAX_PER_BATCH = 5;

const normalizeStatus = (status?: string): UploadPhase => {
  const lower = (status || "").toLowerCase();
  if (
    lower === "queued" ||
    lower === "uploading" ||
    lower === "processing" ||
    lower === "success" ||
    lower === "failed"
  ) {
    return lower as UploadPhase;
  }
  return "idle";
};

const BulkMarkdownUploadPage: React.FC = () => {
  const [fileList, setFileList] = useState<MarkdownUploadFile[]>([]);
  const [fileStates, setFileStates] = useState<Record<string, UploadItemState>>(
    {}
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeBatchLabel, setActiveBatchLabel] = useState("");
  const contentMapRef = useRef<Record<string, string>>({});
  const articleIdMapRef = useRef<Record<number, string>>({});
  const fileStatesRef = useRef<Record<string, UploadItemState>>({});
  const sseAbortRef = useRef<AbortController | null>(null);

  const mdAccept = useMemo(() => ".md,text/markdown", []);

  useEffect(() => {
    fileStatesRef.current = fileStates;
  }, [fileStates]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!fileList.length) {
        return;
      }
      event.preventDefault();
      event.returnValue = "当前上传选择将会清空，是否离开？";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [fileList.length]);

  useEffect(() => {
    return () => {
      if (sseAbortRef.current) {
        sseAbortRef.current.abort();
      }
    };
  }, []);

  const getAuthHeaders = () => {
    if (typeof window === "undefined") {
      return {};
    }
    const headers: Record<string, string> = {};
    try {
      const token = window.localStorage.getItem("satoken");
      if (token) {
        headers["satoken"] = token;
      }
    } catch {
      // ignore
    }
    return headers;
  };

  const joinClientUrl = (path: string) => {
    const base = apiClientBaseUrl || "";
    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${normalizedBase}/${normalizedPath}`;
  };

  const handleSseFile = useCallback((payload: SseFilePayload) => {
    if (!payload || typeof payload.articleId !== "number") {
      return;
    }
    const uid = articleIdMapRef.current[payload.articleId];
    if (!uid) return;
    setFileStates((prev) => {
      const next = { ...prev };
      const prevState = next[uid] || { status: "idle" };
      next[uid] = {
        ...prevState,
        status: normalizeStatus(payload.status),
        message: payload.message,
        articleId: payload.articleId,
        batchId: payload.batchId || prevState.batchId,
      };
      return next;
    });
  }, []);

  const listenToBatch = useCallback(
    (batchId: string) => {
      return new Promise<void>((resolve, reject) => {
        const url = joinClientUrl(`/article/upload/stream/${batchId}`);
        const controller = new AbortController();
        sseAbortRef.current = controller;
        let buffer = "";
        let lastStatus: string | null = null;
        let failureMsg: string | null = null;
        const abortedByClient = { value: false };

        const parseEvent = (raw: string) => {
          const lines = raw.split(/\r?\n/);
          let eventName = "message";
          const dataParts: string[] = [];
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataParts.push(line.slice(5).trim());
            }
          }
          return { eventName, data: dataParts.join("\n") };
        };

        const abortWithMessage = (msg: string) => {
          failureMsg = msg || "批次失败";
          abortedByClient.value = true;
          controller.abort();
        };

        (async () => {
          try {
            const resp = await fetch(url, {
              method: "GET",
              headers: {
                Accept: "text/event-stream",
                ...getAuthHeaders(),
              },
              credentials: "include",
              signal: controller.signal,
            });
            if (!resp.ok || !resp.body) {
              reject(new Error(`SSE 连接失败：${resp.status}`));
              return;
            }
            const reader = resp.body.getReader();
            const decoder = new TextDecoder("utf-8");
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              if (!chunk) continue;
              buffer += chunk;
              const events = buffer.split(/\r?\n\r?\n/);
              buffer = events.pop() || "";
              for (const evt of events) {
                const { eventName, data } = parseEvent(evt);
                if (!data || data === "[DONE]") continue;
                if (eventName === "file-progress") {
                  try {
                    handleSseFile(JSON.parse(data));
                  } catch {
                    // ignore single malformed payload
                  }
                } else if (eventName === "batch-status") {
                  try {
                    const payload: SseBatchPayload = JSON.parse(data);
                    lastStatus = payload.status || null;
                    if (payload.status === "failed") {
                      abortWithMessage(payload.message || "批次失败");
                      break;
                    }
                  } catch {
                    // ignore
                  }
                }
              }
              if (abortedByClient.value) {
                break;
              }
            }
            if (failureMsg) {
              reject(new Error(failureMsg));
            } else if (lastStatus === "completed") {
              resolve();
            } else {
              reject(new Error("批次上传未完成即断开，请重试"));
            }
          } catch (error: any) {
            if (failureMsg) {
              reject(new Error(failureMsg));
            } else if (error?.name === "AbortError" && abortedByClient.value) {
              reject(new Error(failureMsg || "批次已取消"));
            } else {
              reject(error);
            }
          } finally {
            if (sseAbortRef.current === controller) {
              sseAbortRef.current = null;
            }
          }
        })();
      });
    },
    [handleSseFile]
  );

  const chunkFiles = (files: MarkdownUploadFile[], size: number) => {
    const chunks: MarkdownUploadFile[][] = [];
    for (let i = 0; i < files.length; i += size) {
      chunks.push(files.slice(i, i + size));
    }
    return chunks;
  };

  const markFileFailed = useCallback((uid: string, reason: string) => {
    setFileStates((prev) => ({
      ...prev,
      [uid]: {
        ...(prev[uid] || { status: "idle" }),
        status: "failed",
        message: reason,
      },
    }));
  }, []);

  const uploadChunk = useCallback(
    async (chunk: MarkdownUploadFile[]) => {
      if (!chunk.length) return;
      const validFiles = chunk.filter(
        (file): file is MarkdownUploadFile & { originFileObj: File } =>
          Boolean(file.originFileObj)
      );
      if (!validFiles.length) {
        throw new Error("未读取到有效的文件内容");
      }
      setFileStates((prev) => {
        const next = { ...prev };
        validFiles.forEach((file) => {
          next[file.uid] = {
            ...(next[file.uid] || { status: "idle" }),
            status: "queued",
            message: "等待上传",
          };
        });
        return next;
      });

      const rawFiles = validFiles.map((file) => file.originFileObj as File);
      const res = await batchUpload(rawFiles);
      if (!res || res.code !== 0 || !res.data) {
        validFiles.forEach((file) =>
            markFileFailed(file.uid, res?.message || "批次上传失败")
        );
        throw new Error(res?.message || "批次上传失败");
      }
      const { batchId, files: serverFiles } = res.data;
      if (!batchId || !serverFiles?.length) {
        validFiles.forEach((file) =>
          markFileFailed(file.uid, "服务器未返回批次信息")
        );
        throw new Error("服务器未返回批次信息");
      }
      const articleMapUpdates: Record<number, string> = {};
      const nextState: Record<string, UploadItemState> = {};
      const minLen = Math.min(serverFiles.length, validFiles.length);
      for (let i = 0; i < minLen; i++) {
        const descriptor = serverFiles[i];
        const target = validFiles[i];
        if (!descriptor?.articleId) continue;
        articleMapUpdates[descriptor.articleId] = target.uid;
        nextState[target.uid] = {
          ...(fileStatesRef.current[target.uid] || { status: "queued" }),
          status: "queued",
          articleId: descriptor.articleId,
          batchId,
          message: "等待服务器处理",
        };
      }
      if (minLen < validFiles.length) {
        validFiles.slice(minLen).forEach((file) =>
          markFileFailed(file.uid, "服务器未返回对应的文章 ID")
        );
      }
      articleIdMapRef.current = {
        ...articleIdMapRef.current,
        ...articleMapUpdates,
      };
      setFileStates((prev) => ({ ...prev, ...nextState }));
      await listenToBatch(batchId);
    },
    [listenToBatch, markFileFailed]
  );

  const uploadFilesInChunks = useCallback(
    async (targets: MarkdownUploadFile[]) => {
      const available = targets.filter((file) => !!file.originFileObj);
      if (!available.length) {
        throw new Error("请选择至少一个有效文件");
      }
      const chunks = chunkFiles(available, MAX_PER_BATCH);
      setUploading(true);
      try {
        for (let i = 0; i < chunks.length; i++) {
          const label = `批次 ${i + 1}/${chunks.length}`;
          setActiveBatchLabel(label);
          await uploadChunk(chunks[i]);
        }
        message.success("选中文件已全部提交，等待处理完成");
      } finally {
        setActiveBatchLabel("");
        setUploading(false);
      }
    },
    [uploadChunk]
  );

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isMd =
      file.name.toLowerCase().endsWith(".md") || file.type === "text/markdown";
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
        let percent = 0;
        const timer = setInterval(() => {
          percent = Math.min(percent + 20, 90);
          onProgress?.({ percent });
        }, 120);
        const text = await (file as File).text();
        contentMapRef.current[file.uid] = text;
        clearInterval(timer);
        onProgress?.({ percent: 100 });
        onSuccess?.({ code: 0, message: "ok" }, file);
      } catch (e) {
        onError?.(e);
      }
    },
    onChange(info) {
      setFileList(info.fileList as MarkdownUploadFile[]);
      setFileStates((prev) => {
        const next = { ...prev };
        info.fileList.forEach((file) => {
          if (!next[file.uid]) {
            next[file.uid] = { status: "idle" };
          }
        });
        return next;
      });
    },
    onRemove(file) {
      removeFileByUid(file.uid as string);
      return true;
    },
    showUploadList: false,
  };

  const clearAll = () => {
    if (sseAbortRef.current) {
      sseAbortRef.current.abort();
    }
    setFileList([]);
    setFileStates({});
    setSelectedRowKeys([]);
    setActiveBatchLabel("");
    contentMapRef.current = {};
    articleIdMapRef.current = {};
  };

  const previewFileByUid = async (uid: string) => {
    const cached = contentMapRef.current[uid];
    if (cached) {
      setPreviewText(cached);
      setPreviewOpen(true);
      return;
    }
    const target = fileList.find((item) => item.uid === uid);
    if (target?.originFileObj) {
      const text = await target.originFileObj.text();
      setPreviewText(text || "(空文件)");
      setPreviewOpen(true);
      return;
    }
    message.warning("未找到文件内容，请重新选择文件");
  };

  const removeFileByUid = (uid: string) => {
    setFileList((prev) => prev.filter((file) => file.uid !== uid));
    setFileStates((prev) => {
      const next = { ...prev };
      delete next[uid];
      return next;
    });
    setSelectedRowKeys((prev) => prev.filter((key) => key !== uid));
    const mapCopy = { ...articleIdMapRef.current };
    Object.entries(mapCopy).forEach(([articleId, mappedUid]) => {
      if (mappedUid === uid) {
        delete mapCopy[Number(articleId)];
      }
    });
    articleIdMapRef.current = mapCopy;
    delete contentMapRef.current[uid];
  };

  const handleBatchUpload = async () => {
    const targets = fileList.filter((file) =>
      selectedRowKeys.includes(file.uid)
    );
    if (!targets.length) {
      message.warning("请先勾选至少一个文件");
      return;
    }
    try {
      await uploadFilesInChunks(targets);
    } catch (error: any) {
      message.error(error?.message || "批量上传失败");
    }
  };

  const handleRetry = async (uid: string) => {
    const target = fileList.find((file) => file.uid === uid);
    if (!target || !target.originFileObj) {
      message.warning("无法读取该文件内容，请重新选择");
      return;
    }
    try {
      await uploadFilesInChunks([target]);
    } catch (error: any) {
      message.error(error?.message || "重新上传失败");
    }
  };

  const tableData = useMemo(
    () =>
      fileList.map((file) => {
        const state = fileStates[file.uid] || { status: "idle" };
        const size =
          typeof file.size === "number"
            ? file.size
            : file.originFileObj?.size || 0;
        return {
          key: file.uid,
          uid: file.uid,
          name: file.name,
          size,
          articleId: state.articleId,
          status: state.status,
          message: state.message,
        };
      }),
    [fileList, fileStates]
  );

  const formatSize = (size: number) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderStatusTag = (status: UploadPhase) => {
    switch (status) {
      case "queued":
        return <Tag color="default">待上传</Tag>;
      case "uploading":
        return <Tag color="processing">上传中</Tag>;
      case "processing":
        return <Tag color="gold">解析中</Tag>;
      case "success":
        return <Tag color="success">成功</Tag>;
      case "failed":
        return <Tag color="error">失败</Tag>;
      default:
        return <Tag>未开始</Tag>;
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: any) => ({
      disabled: uploading && (record.status === "uploading" || record.status === "processing"),
    }),
  };

  return (
    <div className="bulk-upload-page">
      <Space direction="vertical" size={16} className="bulk-page-space">
        <Card>
          <div className="bulk-header">
            <Title level={3} className="bulk-title">
              文章批量上传
            </Title>
            <Paragraph type="secondary" className="bulk-subtitle">
              一次选择任意数量的 Markdown 文件，系统会自动按 5 个/批次提交，并通过 SSE
              推送 queued / uploading / processing / success / failed 等实时进度，助力快速导入。
            </Paragraph>
          </div>

          <Alert
            type="info"
            showIcon
            message="操作说明"
            description={
              <div>
                <div>1）点击或拖拽 .md 文件到列表，内容只会保存在当前页面，不会立即写入服务端。</div>
                <div>2）勾选需要提交的文件并点击“上传选中文件”，系统会将其按最多 5 个一批依次上传。</div>
                <div>3）每批次的 queued / uploading / processing / success / failed 状态由 SSE 实时推送；仅 success 状态的文件会生成文章 ID，其余可查看提示后重试。</div>
                <div>4）刷新或关闭页面会清空临时列表与队列，如需中断请先等待当前批次完成。</div>
              </div>
            }
          />

          <Card className="bulk-card">
            <Dragger {...uploadProps} className="bulk-dragger">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                点击或拖拽 Markdown 文件到此区域进行上传
              </p>
              <p className="ant-upload-hint">
                可一次选择多个文件，系统会自动按照 5 个/批进行处理（仅限 .md）
              </p>
            </Dragger>

            <div className="bulk-actions">
              <Space>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={clearAll}
                  disabled={!fileList.length}
                >
                  清空列表
                </Button>
              </Space>
              <Space>
                {activeBatchLabel && (
                  <Text type="secondary">{activeBatchLabel}</Text>
                )}
                <Button
                  type="primary"
                  icon={<ImportOutlined />}
                  loading={uploading}
                  onClick={handleBatchUpload}
                  disabled={!selectedRowKeys.length}
                >
                  上传选中文件
                </Button>
              </Space>
            </div>

            <div className="bulk-table-wrapper">
              <Table
                size="middle"
                rowKey="uid"
                pagination={false}
                rowSelection={rowSelection}
                dataSource={tableData}
                columns={[
                  {
                    title: "文件名",
                    dataIndex: "name",
                    key: "name",
                    width: 360,
                    ellipsis: true,
                    render: (text: string) => <Tooltip title={text}>{text}</Tooltip>,
                  },
                  {
                    title: "大小",
                    dataIndex: "size",
                    key: "size",
                    width: 120,
                    align: "center" as const,
                    render: (size: number) => formatSize(size),
                  },
                  {
                    title: "文章 ID",
                    dataIndex: "articleId",
                    key: "articleId",
                    width: 160,
                    align: "center" as const,
                    render: (id?: number) =>
                      id ? <Tag color="blue">{id}</Tag> : <Tag>待生成</Tag>,
                  },
                  {
                    title: "状态",
                    dataIndex: "status",
                    key: "status",
                    width: 140,
                    align: "center" as const,
                    render: (status: UploadPhase) => renderStatusTag(status),
                  },
                  {
                    title: "说明",
                    dataIndex: "message",
                    key: "message",
                    ellipsis: true,
                    render: (msg?: string) =>
                      msg ? (
                        <Tooltip title={msg}>
                          <span>{msg}</span>
                        </Tooltip>
                      ) : (
                        <span>-</span>
                      ),
                  },
                  {
                    title: "操作",
                    key: "action",
                    width: 260,
                    align: "center" as const,
                    render: (_: any, record: any) => {
                      const state = fileStates[record.uid];
                      const status = state?.status || "idle";
                      return (
                        <Space wrap>
                          <Button
                            size="small"
                            icon={<FileMarkdownOutlined />}
                            onClick={() => previewFileByUid(record.uid)}
                          >
                            预览
                          </Button>
                          {status === "failed" && (
                            <Button
                              size="small"
                              icon={<ReloadOutlined />}
                              onClick={() => handleRetry(record.uid)}
                            >
                              重试
                            </Button>
                          )}
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeFileByUid(record.uid)}
                          >
                            移除
                          </Button>
                        </Space>
                      );
                    },
                  },
                ]}
                locale={{
                  emptyText: "暂无文件，请选择或拖拽 Markdown 文件",
                }}
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
        <div className="preview-content">
          <code>{previewText}</code>
        </div>
      </Modal>
    </div>
  );
};

export default BulkMarkdownUploadPage;
