"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, List, Modal, Avatar, message as antdMessage, Spin, Dropdown, Empty } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SendOutlined, StopOutlined, DownOutlined, LoadingOutlined, EllipsisOutlined } from "@ant-design/icons";
import "./styles.css";

import { useAuthStore } from "@/stores/authStore";
import { addChatConversation, getChatHistory, getChatConversationList, deleteChatConversation, updateChatConversation } from "@/api/chatController";
import myAxios from "@/libs/request";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
// import CodeBlock from "@/components/CodeBlock/page";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

interface Conversation {
  id: string;
  title: string; // 前端展示名称，后端字段为 name
  createdAt: number;
  updatedAt: number;
}

const LS_KEYS = {
  conversations: "admin-ai-chat-conversations",
  messagesPrefix: "admin-ai-chat-messages-",
};

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.conversations);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveConversations(list: Conversation[]) {
  localStorage.setItem(LS_KEYS.conversations, JSON.stringify(list));
}

function loadMessages(convId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.messagesPrefix + convId);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessages(convId: string, list: ChatMessage[]) {
  localStorage.setItem(LS_KEYS.messagesPrefix + convId, JSON.stringify(list));
}

const DEFAULT_SSE_ENDPOINT = "/api/admin/ai-chat";

export default function AdminAIChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streaming, setStreaming] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const currentUser = useAuthStore((s) => s.user);
  const userAvatar = currentUser?.userAvatar || "/assets/logo.png";
  const aiAvatar = "/assets/logo.png";

  useEffect(() => {
    (async () => {
      try {
        const resp: any = await getChatConversationList();
        if (resp?.code === 0 && Array.isArray(resp?.data)) {
          const serverList = resp.data as any[];
          const mapped: Conversation[] = serverList.map((c: any) => ({
            id: String(c.id ?? c.conversationId ?? Date.now()),
            title: c.name ?? "",
            createdAt: c.createTime ? new Date(c.createTime).getTime() : Date.now(),
            updatedAt: c.updateTime ? new Date(c.updateTime).getTime() : Date.now(),
          }));
          setConversations(mapped);
          saveConversations(mapped);
          setLoadingHistory(false);
          return;
        }
      } catch (e) {
        // ignore
      }
      const list = loadConversations();
      setConversations(list);
      setLoadingHistory(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const tryFetch = async () => {
      const numericId = Number(activeId);
      if (!Number.isNaN(numericId)) {
        try {
          const resp: any = await getChatHistory({ conversationId: numericId });
          if (resp?.code === 0 && Array.isArray(resp?.data)) {
            const mapped = resp.data.map((m: any) => ({
              id: String(m.id ?? `${Date.now()}-${Math.random()}`),
              role: m.role === "user" || m.role === "assistant" || m.role === "system" ? m.role : "assistant",
              content: typeof m.content === "string" ? m.content : "",
              createdAt: m.createTime ? new Date(m.createTime).getTime() : Date.now(),
            })) as ChatMessage[];
            setMessages(mapped);
            saveMessages(activeId, mapped);
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      const list = loadMessages(activeId);
      setMessages(list);
    };
    tryFetch();
  }, [activeId]);

  useEffect(() => {
    if (!autoScroll) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, autoScroll]);

  // 监听滚动：用户上滚时暂停自动滚动，回到底部时恢复
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 20;
      setAutoScroll(atBottom);
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 当自动滚动开启时，消息更新或流式追加会滚动到底部
  useEffect(() => {
    if (!autoScroll) return;
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming, autoScroll]);

  const updateConversationTitle = useCallback((convId: string, title: string) => {
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === convId ? { ...c, title, updatedAt: Date.now() } : c));
      saveConversations(next);
      return next;
    });
  }, []);

  const removeConversation = useCallback((convId: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== convId);
      saveConversations(next);
      localStorage.removeItem(LS_KEYS.messagesPrefix + convId);
      if (activeId === convId) {
        setActiveId(next[0]?.id ?? null);
      }
      return next;
    });
  }, [activeId]);

  const createConversationLocal = useCallback((title: string): Conversation => {
    const conv: Conversation = {
      id: `${Date.now()}`,
      title: title || "新的对话",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [conv, ...conversations];
    setConversations(next);
    saveConversations(next);
    saveMessages(conv.id, []);
    setActiveId(conv.id);
    return conv;
  }, [conversations]);

  async function streamAssistantAnswer(prompt: string, convId: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    const assistantId = `${Date.now()}-assistant`;
    const userMsg: ChatMessage = { id: `${Date.now()}-user`, role: "user", content: prompt, createdAt: Date.now() };
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "", createdAt: Date.now() };

    setMessages((prev) => {
      const next = [...prev, userMsg, assistantMsg];
      saveMessages(convId, next);
      return next;
    });

    // 优先使用后端流式接口 /chat/completion?message=...&conversationId=...
    // 从 axios 实例中读取统一的 baseURL，避免硬编码
    const apiBase = (myAxios.defaults.baseURL || "").replace(/\/$/, "");
    const sseUrl = apiBase
      ? `${apiBase}/chat/completion?${new URLSearchParams({ message: prompt, conversationId: String(convId) }).toString()}`
      : ((typeof window !== "undefined" && (window as any).__AI_SSE_ENDPOINT) || DEFAULT_SSE_ENDPOINT);

    let receivedAny = false;
    let buffer = ""; // 兼容 text/event-stream 的 data: 格式

    try {
      const resp = await fetch(sseUrl as string, {
        method: "POST",
        headers: { Accept: "text/event-stream" },
        credentials: "include",
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        antdMessage.info(`发送失败：${resp.status} ${resp.statusText || ""}`.trim());
        setStreaming(false);
        abortRef.current = null;
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const isEventStream = /text\/event-stream/i.test(resp.headers.get("content-type") || "");
       while (true) {
         const { value, done } = await reader.read();
         if (done) break;
        const text = decoder.decode(value, { stream: true });
        if (!text) continue;

        if (isEventStream) {
          // 统一按 SSE 事件流解析，处理跨分块边界与多行 data
          buffer += text;
          const events = buffer.split(/\n\n|\r\n\r\n/);
          buffer = events.pop() || "";
          for (const evt of events) {
            const lines = evt.split(/\r?\n/);
            const parts: string[] = [];
            for (const line of lines) {
              if (line.startsWith(":")) continue; // 注释行
              if (line.startsWith("data:")) {
                const part = line.slice(5).trim();
                if (!part || part === "[DONE]") continue;
                parts.push(part);
              }
            }
            if (parts.length) {
              const data = parts.join("\n");
              receivedAny = true;
              setMessages((prev) => {
                const next = prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + data } : m));
                saveMessages(convId, next);
                return next;
              });
            }
          }
        } else {
          // 非标准 SSE（纯文本）场景，兜底去除可能出现的 data: 前缀
          const clean = text.replace(/(^|\n)\s*data:\s?/g, "$1");
          if (clean.trim().length > 0) receivedAny = true;
          setMessages((prev) => {
            const next = prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + clean } : m));
            saveMessages(convId, next);
            return next;
          });
        }
       }

      // 处理读取结束后缓冲区残留的最后一段事件
      if (isEventStream && buffer) {
        const events = buffer.split(/\n\n|\r\n\r\n/);
        for (const evt of events) {
          const lines = evt.split(/\r?\n/);
          const parts: string[] = [];
          for (const line of lines) {
            if (line.startsWith(":")) continue;
            if (line.startsWith("data:")) {
              const part = line.slice(5).trim();
              if (!part || part === "[DONE]") continue;
              parts.push(part);
            }
          }
          if (parts.length) {
            const data = parts.join("\n");
            receivedAny = true;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + data } : m));
              saveMessages(convId, next);
              return next;
            });
          }
        }
      }
     } catch (err: any) {
      antdMessage.info(`发送异常：${err?.message || String(err)}`);
      setStreaming(false);
      abortRef.current = null;
    } finally {
      if (controller.signal.aborted || receivedAny) {
        setStreaming(false);
        abortRef.current = null;
      }
      // 如果当前会话标题为空，用首条用户消息更新本地标题
      const ac = conversations.find((c) => c.id === convId);
      if (ac && !ac.title) {
        updateConversationTitle(convId, (prompt || "新的对话").slice(0, 20));
      }
    }
  }

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    if (streaming) {
      antdMessage.warning("正在生成回复，请稍候...");
      return;
    }

    let convId = activeId;
    const activeConversation = conversations.find((c) => c.id === activeId) || null;

    if (!convId || !activeConversation) {
      try {
        const resp: any = await addChatConversation();
        if (resp?.code === 0 && resp?.data != null) {
          const newId = String(resp.data);
          const conv: Conversation = { id: newId, title: "暂无标题", createdAt: Date.now(), updatedAt: Date.now() };
          const next = [conv, ...conversations];
          setConversations(next);
          saveConversations(next);
          saveMessages(newId, []);
          convId = newId;
        } else {
          antdMessage.error("创建对话失败");
          return;
        }
      } catch (e) {
        antdMessage.error("创建对话失败");
        return;
      }
    } else if (!activeConversation.title) {
      updateConversationTitle(activeConversation.id, prompt.slice(0, 20));
    }

    setActiveId(convId!);
    setInput("");
    await streamAssistantAnswer(prompt, convId!);
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const resp: any = await addChatConversation();
      if (resp?.code === 0 && resp?.data != null) {
        const newId = String(resp.data);
        const conv: Conversation = { id: newId, title: "暂无标题", createdAt: Date.now(), updatedAt: Date.now() };
        const next = [conv, ...conversations];
        setConversations(next);
        saveConversations(next);
        saveMessages(newId, []);
        setActiveId(newId);
      } else {
        antdMessage.error("创建对话失败");
      }
    } catch (e) {
      antdMessage.error("创建对话失败");
    }
  };

  const handleDeleteChat = async () => {
    if (!activeId) return;
    const numericId = Number(activeId);
    if (Number.isNaN(numericId)) {
      removeConversation(activeId);
      antdMessage.success("已删除对话");
      return;
    }
    try {
        const resp: any = await deleteChatConversation({ conversationId: numericId });
        if (resp?.code === 0 && resp?.data) {
          removeConversation(activeId);
          antdMessage.success("已删除对话");
        } else {
          antdMessage.error("删除对话失败");
        }
      } catch (e) {
        antdMessage.error("删除对话失败");
      }
    };

  // 新增：支持按会话ID删除，供列表项菜单调用
  const handleDeleteChatById = async (convId: string) => {
    if (!convId) return;
    const numericId = Number(convId);
    if (Number.isNaN(numericId)) {
      removeConversation(convId);
      antdMessage.success("已删除对话");
      return;
    }
    try {
      const resp: any = await deleteChatConversation({ conversationId: numericId });
      if (resp?.code === 0 && resp?.data) {
        removeConversation(convId);
        antdMessage.success("已删除对话");
      } else {
        antdMessage.error("删除对话失败");
      }
    } catch (e) {
      antdMessage.error("删除对话失败");
    }
  };

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);

  const openRename = (c: Conversation) => {
    setRenameTarget(c);
    setRenameValue(c.title || "");
    setRenameOpen(true);
  };

  const handleRenameOk = async () => {
    if (!renameTarget) return;
    const v = renameValue.trim();
    const numericId = Number(renameTarget.id);
    if (Number.isNaN(numericId)) {
      updateConversationTitle(renameTarget.id, v || "新的对话");
      antdMessage.success("已更新标题");
      setRenameOpen(false);
      setRenameTarget(null);
      return;
    }
    try {
      const payload = { id: numericId, name: v || "新的对话" } as any;
      const resp: any = await updateChatConversation(payload);
      if (resp?.code === 0 && resp?.data) {
        updateConversationTitle(renameTarget.id, v || "新的对话");
        antdMessage.success("已更新标题");
        setRenameOpen(false);
        setRenameTarget(null);
      } else {
        antdMessage.error("更新标题失败");
      }
    } catch (e) {
      antdMessage.error("更新标题失败");
    }
  };

  const menuFor = (c: Conversation) => ({
  items: [
  { key: "rename", label: "重命名", icon: <EditOutlined />, onClick: () => openRename(c) },
  { key: "share", label: "分享", icon: <SendOutlined />, onClick: () => handleShareById(c.id) },
  { key: "delete", label: "删除", icon: <DeleteOutlined />, danger: true, onClick: () => handleDeleteChatById(c.id) },
  ],
  });

  // 分享：将当前会话消息导出为 Markdown 并复制到剪贴板
  const buildShareMarkdown = (conv: Conversation, msgs: ChatMessage[]) => {
    const title = conv.title || "对话";
    const lines: string[] = [
      `# ${title}`,
      "",
      ...msgs.map((m) => `**${m.role === "user" ? "我" : m.role === "assistant" ? "助手" : "系统"}**:\n\n${m.content || ""}`),
    ];
    return lines.join("\n\n");
  };

  const handleShare = async () => {
    if (!activeId) return;
    const conv = conversations.find((c) => c.id === activeId);
    if (!conv) return;
    const msgs = messages;
    const md = buildShareMarkdown(conv, msgs);
    try {
      await navigator.clipboard.writeText(md);
      antdMessage.success("已复制分享内容到剪贴板");
    } catch (e) {
      antdMessage.error("复制失败，请手动复制");
    }
  };

  const handleShareById = async (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const msgs = convId === activeId ? messages : loadMessages(convId);
    const md = buildShareMarkdown(conv, msgs);
    try {
      await navigator.clipboard.writeText(md);
      antdMessage.success("已复制分享内容到剪贴板");
    } catch (e) {
      antdMessage.error("复制失败，请手动复制");
    }
  };

  return (
    <div className="ai-chat-page">
      {/* Sidebar */}
      <div className="ai-chat-sidebar">
        <div className="ai-chat-sidebar-header">
          <span>会话</span>
        </div>
        <div className="ai-chat-new-conv">
            <Button type="default" className="ai-chat-new-btn" icon={<PlusOutlined />} onClick={handleNewChat} block>
              开启新对话
            </Button>
        </div>
        <div className="ai-chat-conv-list">
          {loadingHistory ? (
            <div className="ai-chat-empty"><Spin /></div>
          ) : conversations.length === 0 ? (
            <div className="ai-chat-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会话，点击“开启新对话”开始" /></div>
          ) : (
            (() => {
              const now = new Date();
              const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
              const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
              const sortByUpdatedDesc = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
              const groups: { label: string; items: typeof conversations }[] = [];

              const todayItems = sortByUpdatedDesc.filter(c => c.createdAt >= startOfToday);
              const yesterdayItems = sortByUpdatedDesc.filter(c => c.createdAt < startOfToday && c.createdAt >= startOfYesterday);
              const within7Days = sortByUpdatedDesc.filter(c => c.createdAt < startOfYesterday && (now.getTime() - c.createdAt) <= 7 * 24 * 60 * 60 * 1000);
              const within30Days = sortByUpdatedDesc.filter(c => (now.getTime() - c.createdAt) > 7 * 24 * 60 * 60 * 1000 && (now.getTime() - c.createdAt) <= 30 * 24 * 60 * 60 * 1000);

              if (todayItems.length) groups.push({ label: "今天", items: todayItems });
              if (yesterdayItems.length) groups.push({ label: "昨天", items: yesterdayItems });
              if (within7Days.length) groups.push({ label: "7天内", items: within7Days });
              if (within30Days.length) groups.push({ label: "30天内", items: within30Days });

              // 其余按 年-月 分组
              const older = sortByUpdatedDesc.filter(c => (now.getTime() - c.createdAt) > 30 * 24 * 60 * 60 * 1000);
              const monthMap = new Map<string, typeof conversations>();
              older.forEach(c => {
                const d = new Date(c.createdAt);
                const key = `${d.getFullYear()}年-${String(d.getMonth() + 1).padStart(2, '0')}月`;
                if (!monthMap.has(key)) monthMap.set(key, []);
                monthMap.get(key)!.push(c);
              });
              // 按时间从近到远排序这些月份分组
              const monthGroups = Array.from(monthMap.entries()).sort((a, b) => {
                const ma = a[0].match(/(\d+)年-(\d+)月/);
                const mb = b[0].match(/(\d+)年-(\d+)月/);
                const ad = ma ? new Date(Number(ma[1]), Number(ma[2]) - 1, 1).getTime() : 0;
                const bd = mb ? new Date(Number(mb[1]), Number(mb[2]) - 1, 1).getTime() : 0;
                return bd - ad;
              });
              monthGroups.forEach(([label, items]) => groups.push({ label, items }));

              return (
                <>
                  {groups.map((g, gi) => (
                    <div key={g.label} className="ai-chat-conv-group">
                      {gi !== 0 && <div className="ai-chat-conv-group-divider" />}
                      <div className="ai-chat-conv-group-label">{g.label}</div>
                      {g.items.map((c) => (
                        <div
                          key={c.id}
                          className={`ai-chat-conv-item ${activeId === c.id ? "active" : ""}`}
                          onClick={() => setActiveId(c.id)}
                        >
                          <div className="ai-chat-conv-item__main">
                            <div className="ai-chat-conv-item__title">{c.title || "暂无标题"}</div>
                          </div>
                          <div className="ai-chat-conv-item__actions" onClick={(e) => e.stopPropagation()}>
                            <Dropdown menu={menuFor(c)} trigger={["click"]}>
                              <a onClick={(e) => e.preventDefault()} aria-label="更多操作">
                                <EllipsisOutlined />
                              </a>
                            </Dropdown>
                          </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                );
              })()
            )}
        </div>
      </div>

      {/* Main */}
      <div className="ai-chat-main">
        <div className="ai-chat-main-header">
          <div className="ai-chat-title">{conversations.find((x) => x.id === activeId)?.title || ""}</div>
          <div className="ai-chat-actions">
            <Button onClick={handleShare} icon={<SendOutlined />} disabled={!activeId}>分享</Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteChat} disabled={!activeId}>
              删除
            </Button>
          </div>
        </div>

        <div className="ai-chat-messages" ref={messagesRef}>
          {!activeId || messages.length === 0 ? (
            <div className="ai-chat-welcome">开始一次新的对话吧～</div>
          ) : (
            (() => {
              const isLastAssistantStreaming = streaming && messages[messages.length - 1]?.role === "assistant";
              return (
                <>
                  {messages.map((m, idx) => {
                    const isAssistant = m.role === "assistant";
                    const isLast = idx === messages.length - 1;
                    const showCursor = isLastAssistantStreaming && isLast;
                    const onClickStop = showCursor ? () => handleStop() : undefined;
                    return (
                      <div key={m.id} className={`ai-chat-msg ${isAssistant ? "assistant" : "user"}`} onClick={onClickStop} style={showCursor ? { cursor: "pointer" } : undefined} title={showCursor ? "点击停止回复" : undefined}>
                        <img className="avatar" src={isAssistant ? aiAvatar : userAvatar} alt="avatar" />
                        <div className="bubble">
                          {isAssistant ? (
                            <>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                                components={{
                                  code: ({ className, children, ...props }) => (
                                    <code className={className} {...props}>{children}</code>
                                  ),
                                  p: ({ children }) => <p style={{ margin: "0 0 0.6em 0" }}>{children}</p>,
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                              {showCursor ? <span className="cursor">▍</span> : null}
                            </>
                          ) : (
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                              {m.content}
                              {showCursor ? <span className="cursor">▍</span> : null}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="ai-chat-input">
            <div className="ai-chat-input-row">
              <Input.TextArea
                className="ai-chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoSize={{ minRows: 2, maxRows: 6 }}
                placeholder="输入你的问题..."
              />
              <Button
                className="ai-chat-send-btn-inline"
                type="primary"
                onClick={streaming ? handleStop : async () => {
                  try {
                    await handleSend();
                  } catch (err: any) {
                    antdMessage.info(`发送异常：${err?.message || String(err)}`);
                  }
                }}
                icon={streaming ? <LoadingOutlined /> : <SendOutlined />}
                danger={streaming}
              >
                {streaming ? "停止" : "发送"}
              </Button>
            </div>
          </div>
      </div>

      <Modal
        title="重命名对话"
        open={renameOpen}
        onOk={handleRenameOk}
        onCancel={() => {
          setRenameOpen(false);
          setRenameTarget(null);
        }}
      >
        <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="输入新标题" />
      </Modal>
    </div>
  );
}