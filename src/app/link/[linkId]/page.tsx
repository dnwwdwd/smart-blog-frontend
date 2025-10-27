"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Empty, Spin, Tag, message } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import "./styles.css";
import { getFriendLinkPage } from "@/api/friendLinkController";
import FriendLinkApplyModal from "@/components/FriendLinkApplyModal";

const iconMeta: Record<string, { label: string; emoji: string; color: string }> = {
  github: { label: "GitHub", emoji: "🐙", color: "#24292e" },
  wechat: { label: "微信", emoji: "💬", color: "#1AAD19" },
  qq: { label: "QQ", emoji: "🔵", color: "#1890ff" },
  x: { label: "X", emoji: "✖️", color: "#111" },
  website: { label: "网站", emoji: "🌐", color: "#3f63ff" },
  email: { label: "Email", emoji: "📧", color: "#ff6b6b" },
};

const LinkDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const linkId = params.linkId as string;
  const [linkData, setLinkData] = useState<API.FriendLinkVo | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res: any = await getFriendLinkPage({ current: 1, pageSize: 1, id: Number(linkId) });
        const record = res?.data?.records?.[0] || null;
        setLinkData(record);
      } catch {
        setLinkData(null);
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      fetchDetail();
    }
  }, [linkId]);

  const contacts = useMemo(() => {
    if (!linkData?.socialLinks?.length) return [];
    return linkData.socialLinks
      .filter((item) => Boolean(item.iconUrl))
      .map((item, index) => ({
        id: `${item.iconType}-${index}`,
        platform: iconMeta[item.iconType || "website"]?.label || item.iconType || "链接",
        emoji: iconMeta[item.iconType || "website"]?.emoji || "🔗",
        color: iconMeta[item.iconType || "website"]?.color || "#3f63ff",
        value: item.iconUrl || "",
        isLink: /^https?:/i.test(item.iconUrl || ""),
      }));
  }, [linkData?.socialLinks]);

  const handleBack = () => {
    router.push("/links");
  };

  const primaryName = linkData?.name?.split("_")[0] || linkData?.name || "";
  const secondaryName = linkData?.name?.split("_")[1];

  if (loading) {
    return (
      <div className="link-detail-page">
        <div className="link-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="link-detail-page">
        <div className="link-detail-container">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="link-toolbar-back">
            返回友链列表
          </Button>
          <Card style={{ marginTop: 24 }}>
            <Empty description="未找到该友链或尚未通过审核" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="link-detail-page">
      <div className="link-background" aria-hidden />
      <div className="link-detail-container">
        <div className="link-toolbar">
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="link-toolbar-back">
            返回友链列表
          </Button>
          <div className="link-toolbar-actions">
            <Button icon={<LinkOutlined />} shape="round" onClick={() => router.push(linkData.url || "#")}>
              访问该站点
            </Button>
          </div>
        </div>

        <section className="link-hero-card">
          <div className="link-avatar-wrapper">
            <div className="link-avatar-glow" aria-hidden />
            {linkData.avatar ? (
              <Image src={linkData.avatar} alt={linkData.name || "友链"} width={140} height={140} className="link-avatar" />
            ) : (
              <div className="link-avatar placeholder">{primaryName?.charAt(0)}</div>
            )}
          </div>
          <div className="link-hero-content">
            <h1 className="link-name">
              <span className="link-name-primary">{primaryName}</span>
              {secondaryName ? <span className="link-name-secondary">_{secondaryName}</span> : null}
            </h1>
            {linkData.statusLabel && (
              <Tag color="blue" style={{ marginBottom: 12 }}>{linkData.statusLabel}</Tag>
            )}
            <p className="link-description">{linkData.description || "该站点很酷，点上方按钮去看看吧！"}</p>
            <div className="link-hero-actions">
              <Button type="primary" shape="round" onClick={() => setApplyOpen(true)}>
                我要交换友链
              </Button>
              <Button shape="round" onClick={() => router.push(linkData.url || "/")}>访问网站</Button>
            </div>
          </div>
        </section>

        <section className="link-contact-section">
          <div className="link-section-header">
            <h2 className="link-section-title">联系渠道</h2>
            <span className="link-section-subtitle">通过以下方式联系站长</span>
          </div>
          {contacts.length === 0 ? (
            <Card className="link-contact-card" variant={false}>
              <Empty description="站长暂未提供联系渠道" />
            </Card>
          ) : (
            <div className="link-contact-grid">
              {contacts.map((contact) => (
                <Card key={contact.id} className="link-contact-card" variant={false}>
                  <div className="link-contact-header">
                    <div className="link-contact-icon" style={{ backgroundColor: contact.color }}>
                      {contact.emoji}
                    </div>
                  </div>
                  <div className="link-contact-body">
                    <div className="link-contact-platform">{contact.platform}</div>
                    <div className="link-contact-nickname">{contact.value}</div>
                  </div>
                  <Button
                    type="primary"
                    shape="round"
                    className="link-contact-button"
                    href={contact.isLink ? contact.value : undefined}
                    target={contact.isLink ? "_blank" : undefined}
                    onClick={
                      contact.isLink
                        ? undefined
                        : () => {
                            navigator.clipboard.writeText(contact.value || "");
                            message.success("已复制联系信息");
                          }
                    }
                  >
                    {contact.isLink ? "打开链接" : "复制信息"}
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      <FriendLinkApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </div>
  );
};

export default LinkDetailPage;
