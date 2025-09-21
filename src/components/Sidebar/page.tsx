"use client";

import React from "react";
import {
  Avatar,
  Button,
  Card,
  Divider,
  message,
  Popover,
  QRCode,
  Space,
  Tooltip,
} from "antd";
import {
  GithubOutlined,
  HeartOutlined,
  LinkedinOutlined,
  MailOutlined,
  WechatOutlined,
  XOutlined,
} from "@ant-design/icons";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import {
  useSiteSettings,
  useSiteSettingsLoading,
} from "@/stores/siteSettingsStore";
import { useCurrentUser } from "@/stores/authStore";

// Mock 赞助数据
const sponsors = [
  {
    id: 1,
    name: "Temp Mail",
    description: "临时邮箱生成工具",
    icon: "📧",
    url: "#",
  },
  {
    id: 2,
    name: "孔乙己文学",
    description: "文学创作平台",
    icon: "📚",
    url: "#",
  },
  { id: 3, name: "Yachen", description: "小程序开发", icon: "💻", url: "#" },
];

export default function Sidebar() {
  const settings = useSiteSettings();
  const loading = useSiteSettingsLoading();
  // removed user avatar for visitor view

  if (loading) {
    return <div className="sidebar">加载中...</div>;
  }

  const avatarSrc =
    settings?.aboutImage || settings?.siteLogo || "/assets/avatar.svg";

  return (
    <div className="sidebar">
      {/* 用户信息卡片 */}
      <Card className="user-card" styles={{ body: { padding: "24px" } }}>
        <div className="user-info">
          <div className="user-avatar-section">
            <Avatar size={80} src={avatarSrc} className="user-avatar" />
            <div className="user-badge">🏆</div>
          </div>

          <div className="user-details">
            <Title level={4} style={{ textAlign: "center" }}>
              {settings?.siteName || "Smart Blog"}
            </Title>
            <br />
            <span className="user-subtitle">
              {settings?.siteDescription || "分享科技与生活的美好"}
            </span>
          </div>

          <div className="user-actions">
            <Space size={12}>
              {/* 微信悬浮展示二维码（放大） */}
              {settings?.wechatQrUrl && (
                <Popover
                  placement="bottom"
                  content={
                    <div style={{ padding: 8 }}>
                      <img
                        src={settings.wechatQrUrl}
                        alt="WeChat QR"
                        width={200}
                        height={200}
                      />
                    </div>
                  }
                  styles={{ body: { padding: 12 } }}
                  trigger={["hover"]}
                >
                  <WechatOutlined style={{ color: "#52c41a" }} />
                </Popover>
              )}

              {settings?.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubOutlined />
                </a>
              )}

              {settings?.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <XOutlined />
                </a>
              )}

              {settings?.emailContact && (
                <Tooltip title={settings.emailContact} placement="bottom">
                  <span
                    aria-label="email"
                    role="img"
                    style={{ cursor: "default" }}
                  >
                    <MailOutlined />
                  </span>
                </Tooltip>
              )}
            </Space>
          </div>
        </div>
      </Card>

      {/* 公众号推广 */}
      <Card
        className="promotion-card"
        title={
          <div className="card-title">
            <WechatOutlined style={{ color: "#07c160", marginRight: 8 }} />
            公众号
          </div>
        }
        styles={{ body: { padding: "20px", textAlign: "center" } }}
      >
        <div className="qr-section">
          <div className="qr-placeholder">
            <QRCode
              value="https://mp.weixin.qq.com/"
              size={120}
              style={{ margin: "0 auto" }}
            />
          </div>
          <Paragraph
            style={{ margin: "12px 0 0 0", fontSize: 13, color: "#666" }}
          >
            扫码关注公众号
          </Paragraph>
        </div>
      </Card>

      {/* 正在赞助本站 */}
      <Card
        className="sponsor-card"
        title={
          <div className="card-title">
            <HeartOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
            正在赞助本站
          </div>
        }
        extra={
          <Button type="link" size="small" style={{ padding: 0 }}>
            赞助
          </Button>
        }
        styles={{ body: { padding: "16px 20px" } }}
      >
        <div className="sponsor-list">
          {sponsors.map((sponsor, index) => (
            <div key={sponsor.id}>
              <div className="sponsor-item">
                <div className="sponsor-icon">{sponsor.icon}</div>
                <div className="sponsor-info">
                  <div className="sponsor-name">{sponsor.name}</div>
                  <div className="sponsor-desc">{sponsor.description}</div>
                </div>
              </div>
              {index < sponsors.length - 1 && (
                <Divider style={{ margin: "12px 0" }} />
              )}
            </div>
          ))}
        </div>

        <div className="sponsor-footer">
          <span style={{ fontSize: 12 }}>感谢以上赞助商的支持</span>
        </div>
      </Card>
    </div>
  );
}
