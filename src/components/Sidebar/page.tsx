"use client";

import React, { useEffect } from "react";
import { Avatar, Button, Card, Divider, Popover, Space, Tooltip } from "antd";
import {
  GithubOutlined,
  HeartOutlined,
  MailOutlined,
  WechatOutlined,
  XOutlined,
} from "@ant-design/icons";
import "./styles.css";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import Image from "next/image";
import {
  useSiteSettings,
  useSiteSettingsLoading,
} from "@/stores/siteSettingsStore";
import { useRewardMessages, useRewardMessageLoading, useRewardMessageStore } from "@/stores/rewardMessageStore";
import {
  useAuthorProfile,
  useAuthorProfileLoading,
  useFetchAuthorProfile,
} from "@/stores/authorProfileStore";

export default function Sidebar() {
  const settings = useSiteSettings();
  const loading = useSiteSettingsLoading();
  const sponsorMessages = useRewardMessages();
  const sponsorLoading = useRewardMessageLoading();
  const fetchSponsorMessages = useRewardMessageStore((state) => state.fetchApproved);
  const authorProfile = useAuthorProfile();
  const authorLoading = useAuthorProfileLoading();
  const fetchAuthorProfile = useFetchAuthorProfile();

  useEffect(() => {
    fetchSponsorMessages();
    if (!authorProfile) {
      fetchAuthorProfile();
    }
  }, [fetchSponsorMessages, fetchAuthorProfile, authorProfile]);

  if (loading || (authorLoading && !authorProfile)) {
    return <div className="sidebar">加载中...</div>;
  }

  const avatarSrc =
    authorProfile?.userAvatar ||
    settings?.aboutImage ||
    settings?.siteLogo ||
    "/assets/avatar.svg";
  const authorName =
    authorProfile?.username || settings?.siteName || "Smart Blog";
  const authorBio =
    authorProfile?.profile || settings?.siteDescription || "分享科技与生活的美好";

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
              {authorName}
            </Title>
            <br />
            <span className="user-subtitle">
              {authorBio}
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
                      <Image
                        src={settings.wechatQrUrl}
                        alt="WeChat QR"
                        width={200}
                        height={200}
                        unoptimized
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
      {settings?.wechatOfficialQrUrl && (
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
              <Image
                src={settings.wechatOfficialQrUrl}
                alt="公众号二维码"
                width={140}
                height={140}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
            <Paragraph
              style={{ margin: "12px 0 0 0", fontSize: 13, color: "#666" }}
            >
              扫码关注公众号
            </Paragraph>
          </div>
        </Card>
      )}

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
          {sponsorLoading ? (
            <span>加载赞助信息...</span>
          ) : sponsorMessages.length === 0 ? (
            <span style={{ fontSize: 12, color: "#666" }}>
              赞助留言审核通过后将展示在此处
            </span>
          ) : (
            sponsorMessages.map((sponsor, index) => (
              <div key={sponsor.id || index}>
                <div className="sponsor-item">
                  <div className="sponsor-icon">💖</div>
                  <div className="sponsor-info">
                    <div className="sponsor-name">{sponsor.nickname}</div>
                    <div className="sponsor-desc">
                      {sponsor.message}
                      {sponsor.website && (
                        <div>
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12 }}
                          >
                            {sponsor.website}
                          </a>
                        </div>
                      )}
                      {typeof sponsor.amount === "number" && (
                        <div style={{ marginTop: 4, fontWeight: 500 }}>
                          支持金额：¥{Number(sponsor.amount).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < sponsorMessages.length - 1 && (
                  <Divider style={{ margin: "12px 0" }} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="sponsor-footer">
          <span style={{ fontSize: 12 }}>感谢以上赞助商的支持</span>
        </div>
      </Card>
    </div>
  );
}
