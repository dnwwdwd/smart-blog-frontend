"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import "./styles.css";
import { useSiteSettings } from "@/stores/siteSettingsStore";

// 默认数据
const highlights = [
  {
    title: "持续创作",
    description: "每周更新技术文章和实践笔记，让灵感保持新鲜，与读者共同成长。",
    icon: "✍️",
  },
  {
    title: "全栈视角",
    description: "关注前端体验、后端工程化与效率工具，以系统化方式沉淀经验。",
    icon: "🧠",
  },
  {
    title: "构建社群",
    description: "通过直播、技术群与线下活动，连接更多开发者，分享真实故事。",
    icon: "🤝",
  },
];

const timeline = [
  {
    time: "2024 - 至今",
    title: "Smart Blog 2.0",
    description: "升级为智能写作与知识管理平台，结合 AI 助手与数据分析。",
  },
  {
    time: "2022 - 2023",
    title: "全栈实践者",
    description: "在成长型团队负责从产品验证到交付上线的全链路工作。",
  },
  {
    time: "2019 - 2021",
    title: "前端工程化探索",
    description: "聚焦性能、体验与研发效率，推动组件化与自动化测试落地。",
  },
];

const toolstack = [
  { title: "前端", items: ["Next.js", "React", "TailwindCSS", "UnoCSS"] },
  { title: "服务端", items: ["Node.js", "NestJS", "PostgreSQL", "Redis"] },
  { title: "效率", items: ["Notion", "Raycast", "Linear", "Obsidian"] },
];

const values = [
  "用真实输出换取长久信任",
  "保持好奇心，拥抱新工具",
  "让复杂问题被更多人理解",
];

export default function AboutPage() {
  const settings = useSiteSettings();
  // removed: const user = useCurrentUser();

  const socialLinks = [
    settings?.githubUrl && { label: "GitHub", href: settings.githubUrl },
    settings?.twitterUrl && { label: "X (Twitter)", href: settings.twitterUrl },
    settings?.emailContact && { label: "Email", href: `mailto:${settings.emailContact}` },
    settings?.wechatQrUrl && { label: "WeChat", href: settings.wechatQrUrl },
  ].filter(Boolean) as { label: string; href: string }[];

  // 访客视角头像：优先用关于页图片，其次站点 Logo，最后本地 svg
  const avatarSrc = settings?.aboutImage || settings?.siteLogo || "/assets/avatar.svg";

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__text">
          <span className="about-hero__eyebrow">
            {settings?.aboutTitle || "关于 Smart Blog"}
          </span>
          <h1>记录技术，连接灵感</h1>
          <p>
            {settings?.aboutContent ||
              "Smart Blog 是一个围绕开发者成长构建的内容实验室。我相信知识应该更易获取，更易实践，并在分享与反馈中持续迭代。"}
          </p>
          <div className="about-hero__actions">
            <Link href="/articles">阅读最新文章</Link>
            <Link href="/columns" className="ghost">
              浏览专题专栏
            </Link>
          </div>
        </div>
        <div className="about-hero__avatar" aria-hidden="true">
          <Image
            unoptimized
            src={avatarSrc}
            alt="作者头像"
            width={220}
            height={220}
            priority
            sizes="(max-width: 768px) 160px, 220px"
          />
        </div>
      </section>

      {/* 我在做什么 */}
      <section className="about-section">
        <h2 className="about-section__title">我在做什么</h2>
        <div className="about-card-grid">
          {highlights.map((item) => (
            <article key={item.title} className="about-card">
              <span className="about-card__icon" aria-hidden="true">
                {item.icon}
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 旅程节选 */}
      <section className="about-section">
        <h2 className="about-section__title">旅程节选</h2>
        <ol className="about-timeline">
          {timeline.map((item) => (
            <li key={item.title}>
              <span className="about-timeline__time">{item.time}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 价值主张 */}
      <section className="about-section">
        <h2 className="about-section__title">价值主张</h2>
        <ul className="about-pill-list">
          {values.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* 常用工具箱 */}
      <section className="about-section">
        <h2 className="about-section__title">常用工具箱</h2>
        <div className="about-card-grid">
          {toolstack.map((group) => (
            <article
              key={group.title}
              className="about-card about-card--minimal"
            >
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 保持联系 */}
      <section className="about-section about-section--footer">
        <div>
          <h2 className="about-section__title">保持联系</h2>
          <p>如果你也在构建有趣的产品，欢迎一起交流想法。</p>
        </div>
        <div className="about-links">
          {socialLinks.map((link) => (
            <Link key={link.label} href={link.href} prefetch={false} target={link.href.startsWith('http') ? '_blank' : undefined}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
