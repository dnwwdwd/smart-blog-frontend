"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, Spin, Alert, message as antdMessage, Tooltip } from "antd";
import { SendOutlined, CloseOutlined, LoadingOutlined, DownOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import '@/app/admin/ai-chat/styles.css';
import "./styles.css";
import myAxios from "@/libs/request";

const { TextArea } = Input;

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface AIChatModalProps {
  open: boolean;
  onClose: () => void;
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

function useAutoScroll(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
      setAutoScroll(isAtBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [containerRef]);

  return { autoScroll, scrollToBottom };
}

const AIChatModal: React.FC<AIChatModalProps> = ({ open, onClose }) => {
  // 移除会话相关状态，仅保留消息、输入与流式状态
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { autoScroll, scrollToBottom } = useAutoScroll(messagesRef);

  const handleAbort = useCallback(() => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
      abortRef.current = null;
    }
    setStreaming(false);
    antdMessage.info("已停止生成");
  }, []);

  // 打开时重置为全新对话，关闭时中止流
  useEffect(() => {
    if (open) {
      setMessages([]);
      setInput("");
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setStreaming(false);
      setTimeout(() => scrollToBottom(), 0);
    } else {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      setStreaming(false);
    }
  }, [open, scrollToBottom]);

  // 自动滚动
  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, streaming, autoScroll, scrollToBottom]);

  async function streamAssistantAnswer(prompt: string, convId: string = "0") {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    const assistantId = `${Date.now()}-assistant`;
    const userMsg: ChatMessage = { id: `${Date.now()}-user`, role: "user", content: prompt, createdAt: Date.now() } as any;
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "", createdAt: Date.now() } as any;

    setMessages((prev) => {
      const next = [...prev, userMsg, assistantMsg];
      return next;
    });

    const apiBase = (myAxios.defaults.baseURL || "").replace(/\/$/, "");
    const sseUrl = apiBase
      ? `${apiBase}/chat/completion?${new URLSearchParams({ message: prompt, conversationId: String(0) }).toString()}`
      : ((typeof window !== "undefined" && (window as any).__AI_SSE_ENDPOINT) || DEFAULT_SSE_ENDPOINT);

    let receivedAny = false;
    let buffer = "";

    try {
      const resp = await fetch(sseUrl as string, {
        method: "POST",
        headers: { Accept: "text/event-stream", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt, message: prompt, conversationId: 0 }),
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
          buffer += text;
          const events = buffer.split(/\n\n|\r\n\r\n/);
          buffer = events.pop() || "";
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
              let toAppend = data;
              try {
                const parsed = JSON.parse(data);
                if (parsed) {
                  if (typeof parsed === "string") toAppend = parsed;
                  else if (parsed.content != null) toAppend = String(parsed.content);
                  else if (parsed.delta && parsed.delta.content != null) toAppend = String(parsed.delta.content);
                  else if (parsed.choices && parsed.choices[0]?.delta?.content != null) toAppend = String(parsed.choices[0].delta.content);
                  else if (parsed.text != null) toAppend = String(parsed.text);
                  else if (parsed.answer != null) toAppend = String(parsed.answer);
                }
              } catch {}
              receivedAny = true;
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + toAppend } : m)));
            }
          }
        } else {
          const clean = text.replace(/(^|\n)\s*data:\s?/g, "$1");
          let toAppend = clean;
          try {
            const parsed = JSON.parse(clean);
            if (parsed) {
              if (typeof parsed === "string") toAppend = parsed;
              else if (parsed.content != null) toAppend = String(parsed.content);
              else if (parsed.delta && parsed.delta.content != null) toAppend = String(parsed.delta.content);
              else if (parsed.choices && parsed.choices[0]?.delta?.content != null) toAppend = String(parsed.choices[0].delta.content);
              else if (parsed.text != null) toAppend = String(parsed.text);
              else if (parsed.answer != null) toAppend = String(parsed.answer);
            }
          } catch {}
          if (toAppend.trim().length > 0) receivedAny = true;
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + toAppend } : m)));
        }
      }

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
            let toAppend = data;
            try {
              const parsed = JSON.parse(data);
              if (parsed) {
                if (typeof parsed === "string") toAppend = parsed;
                else if (parsed.content != null) toAppend = String(parsed.content);
                else if (parsed.delta && parsed.delta.content != null) toAppend = String(parsed.delta.content);
                else if (parsed.choices && parsed.choices[0]?.delta?.content != null) toAppend = String(parsed.choices[0].delta.content);
                else if (parsed.text != null) toAppend = String(parsed.text);
                else if (parsed.answer != null) toAppend = String(parsed.answer);
              }
            } catch {}
            receivedAny = true;
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + toAppend } : m)));
          }
        }
      }
    } catch (err: any) {
      antdMessage.info(`发送异常：${err?.message || String(err)}`);
      setStreaming(false);
      abortRef.current = null;
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt) return;
    if (streaming) { antdMessage.warning("正在生成回复，请稍候..."); return; }
    setInput("");
    await streamAssistantAnswer(prompt);
  }, [input, streaming]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === "Enter" || e.key === "Return") && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  // 仅在“助手气泡为空内容且处于流式中”时展示加载提示
  const lastMsg = messages[messages.length - 1];
  const showInitLoader = !!(streaming && lastMsg?.role === "assistant" && !lastMsg.content);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI 助手聊天"
      className="ai-chat-modal-mask"
      onClick={onClose}
    >
      <div className="ai-chat-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ai-chat-main">
          <div className="ai-chat-main-header">
            <div className="ai-chat-header-left">
              <div className="ai-chat-title">AI 助手</div>
              {messages.length === 0 && (
                <Alert
                  className="ai-chat-header-alert"
                  type="info"
                  showIcon
                  banner
                  message="你好！我可以帮助你起草文章、润色内容或回答问题。"
                />
              )}
            </div>
            <div className="ai-chat-actions">
              <Tooltip title="关闭">
                <Button
                  type="text"
                  className="ai-chat-close-btn"
                  onClick={onClose}
                  icon={<CloseOutlined />}
                />
              </Tooltip>
            </div>
          </div>

          <div className="ai-chat-messages" ref={messagesRef}>
            {messages.map((m) => {
              if (m.role === "assistant" && !m.content) return null;
              return (
                <div key={m.id} className={`ai-chat-msg ${m.role}`}>
                  <div className="bubble">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm] as any}
                      rehypePlugins={[rehypeRaw as any, rehypeSanitize as any, rehypeHighlight as any]}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
            {showInitLoader && (
              <div className="ai-chat-loading">
                <Spin size="small" />
                <span>AI 正在生成...</span>
              </div>
            )}
          </div>

          {!autoScroll && (
            <Tooltip title="滚动到底部">
              <Button
                type="primary"
                shape="circle"
                size="large"
                className="ai-chat-scroll-bottom"
                icon={<DownOutlined />}
                onClick={scrollToBottom}
                aria-label="滚动到底部"
              />
            </Tooltip>
          )}

          <div className="ai-chat-input ai-chat-input-row">
            <div className="ai-chat-textarea">
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoSize={{ minRows: 2, maxRows: 6 }}
                placeholder="输入你的问题，Shift+Enter 换行"
              />
            </div>
            {streaming ? (
              <div
                role="button"
                aria-label="停止生成"
                title="点击停止生成"
                tabIndex={0}
                onClick={handleAbort}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAbort();
                  }
                }}
                className="ai-chat-abort-trigger"
              >
                <LoadingOutlined spin />
              </div>
            ) : (
              <Button
                type="primary"
                className="ai-chat-send-btn-inline"
                icon={<SendOutlined />}
                disabled={!input.trim()}
                onClick={handleSend}
                size="large"
              >
                发送
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
