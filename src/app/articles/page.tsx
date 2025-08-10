"use server";
import React from "react";
import ArticleList from "@/components/ArticleList/page";
import Sidebar from "@/components/Sidebar/page";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import "./styles.css";
import { getArticlePage } from "@/api/api/articleController";

const mockArticles = [
  {
    id: 1,
    title: "如何制作加载动画图？在线生成炫酷loading图支持SVG、APNG、GIF",
    category: "加载动画",
    date: "2025-01-01",
    author: "张洪Heo",
    avatar:
      "https://hejiajun-img-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/image-20241119111441579.png",
    excerpt:
      "本文介绍如何制作各种炫酷的加载动画，支持多种格式输出，包括SVG、APNG、GIF等。",
    tags: ["前端", "动画", "SVG"],
    color: "#4285f4",
    coverImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "洪哥闪回来了！论坛快捷回复，自动填充随机短语，测览器插件",
    category: "浏览器插件",
    date: "2024-12-28",
    author: "张洪Heo",
    avatar:
      "https://hejiajun-img-bucket.oss-cn-wuhan-lr.aliyuncs.com/img/image-20241119111441579.png",
    excerpt: "一个实用的浏览器插件，帮助用户快速回复论坛内容，提高交流效率。",
    tags: ["插件", "效率工具"],
    color: "#34a853",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
  },
];

export default async function ArticlesPage() {
  let articleList = [];

  const res = await getArticlePage({
    current: 1,
    pageSize: 10,
  });

  articleList = res.data.records || [];

  return (
    <div className="articles-page">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容区 - 2/3宽度 */}
          <div className="lg:col-span-2">
            <div className="articles-header mb-6">
              <Title level={2}>📚 文章列表</Title>
              <Paragraph type="secondary">分享技术心得，记录学习历程</Paragraph>
            </div>
            {/* 这里传入整个文章数组 */}
            <ArticleList articles={articleList} />
          </div>

          {/* 侧边栏 - 1/3宽度 */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
