"use server";
import React from "react";
import { Alert, Card, Col, Divider, Row, Space, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  OpenAIOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Sidebar from "@/components/Sidebar/page";
import ArticleList from "@/components/ArticleList/page";
import CommentSection from "@/components/CommentSection/page";
import CodeBlock from "@/components/CodeBlock/page";
import RewardModal from "@/components/RewardModal";
import ArticleDetailClient from "./ArticleDetailClient";
import "./styles.css";
import "highlight.js/styles/github-dark.css";
import { getArticleVoById } from "@/api/articleController";
import { formatDate } from "@/utils";

interface ArticlePageProps {
  params: Promise<{
    articleId: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleId } = await params;
  let article: any = null;

  if (!articleId) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>无效的文章ID。</span>
      </div>
    );
  }

  try {
    const res = await getArticleVoById({ articleId });
    article = res.data;
  } catch (error) {
    console.log(error);
  }

  // 生成目录 - 确保 content 存在
  const tocItems = article?.content ? generateTOC(article.content) : [];
  // 同步渲染期间统计各标题出现次数，用于生成唯一 slug，确保与 TOC 对齐
  const headingCounts = new Map<string, number>();

  if (!article) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Title level={2}>文章未找到</Title>
        <span>抱歉，您访问的文章不存在或已被删除。</span>
      </div>
    );
  }

  return (
    <ArticleDetailClient 
      article={article}
      tocItems={tocItems}
    />
  );
}

// 生成 slug 的工具方法
const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const anyProps = (node.props as any) || {};
    return extractText(anyProps.children);
  }
  return "";
};

const slugify = (text: string) =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // remove html tags if any
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "") // keep letters/numbers/space/-/_
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// 生成目录的函数（基于内容文本，使用 slug 作为 href）
const generateTOC = (content: string) => {
  if (!content || typeof content !== "string") return [] as any[];
  const lines = content.split(/\n/);
  const toc: { key: string; href: string; title: string; level: number }[] = [];
  const counts = new Map<string, number>();

  let inFence = false;
  let fenceMarker: string | null = null; // ``` or ~~~

  const pushItem = (rawTitle: string, level: number) => {
    const title = rawTitle.trim().replace(/\s+#+\s*$/, ""); // 去掉行尾多余 #
    const base = slugify(title);
    const c = (counts.get(base) || 0) + 1;
    counts.set(base, c);
    const slug = c > 1 ? `${base}-${c}` : base;
    toc.push({ key: `#${slug}`, href: `#${slug}`, title, level });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 处理围栏代码块，忽略其内的所有内容
    const fenceStart = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fenceStart) {
      const marker = fenceStart[2];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
        continue;
      } else if (inFence && marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = null;
        continue;
      }
    }
    if (inFence) continue;

    // ATX 标题：# / ## / ... ######（允许尾部关闭 #）
    const atx = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (atx) {
      const level = atx[1].length;
      const raw = atx[2];
      pushItem(raw, level);
      continue;
    }

    // Setext 标题：上一行是文本，下一行是 === 或 ---
    if (i + 1 < lines.length) {
      const underline = lines[i + 1];
      if (/^\s*=+\s*$/.test(underline)) {
        // h1
        const raw = line.trim();
        if (raw) pushItem(raw, 1);
        i++; // 跳过下划线行
        continue;
      } else if (/^\s*-+\s*$/.test(underline)) {
        // h2
        const raw = line.trim();
        if (raw) pushItem(raw, 2);
        i++;
        continue;
      }
    }
  }

  return toc;
};
