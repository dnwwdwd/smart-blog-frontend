"use client";
import React from "react";
import { Button, Card } from "antd";
import {
  ArrowLeftOutlined,
  QrcodeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import "./styles.css";

interface ContactCard {
  id: string;
  platform: string;
  nickname: string;
  icon: string;
  color: string;
}

const LinkDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const linkId = params.linkId as string;

  // 模拟数据
  const linkData = {
    id: linkId,
    name: "白鲸_Cofcat",
    description:
      "你好，我叫白鲸，你也可以叫我Macon，我是一只猫猫，还是一个程序员。",
    userAvatar:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face",
    contacts: [
      {
        id: "1",
        platform: "QQ",
        nickname: "123456789",
        icon: "💬",
        color: "#1890ff",
      },
      {
        id: "2",
        platform: "抖音",
        nickname: "@cofcat_dev",
        icon: "🎵",
        color: "#ff4757",
      },
    ] as ContactCard[],
  };

  const handleBack = () => {
    router.push("/links");
  };

  const handleQRCode = () => {
    // 显示二维码逻辑
    console.log("显示二维码");
  };

  const handleContact = (contact: ContactCard) => {
    // 处理联系方式点击
    console.log("联系:", contact.platform);
  };

  const handleFavorite = (contactId: string) => {
    // 处理收藏
    console.log("收藏:", contactId);
  };

  return (
    <div className="link-detail-page">
      {/* 背景装饰 */}
      <div className="bg-decoration bg-decoration-left"></div>
      <div className="bg-decoration bg-decoration-right"></div>

      <div className="detail-container">
        {/* 用户信息区域 */}
        <div className="user-info">
          <div className="user-userAvatar">
            <img src={linkData.userAvatar} alt={linkData.name} />
          </div>
          <h1 className="user-name">
            {linkData.name.split("_")[0]}
            <span className="name-highlight">
              _{linkData.name.split("_")[1]}
            </span>
            <StarOutlined className="name-star" />
          </h1>
          <p className="user-description">{linkData.description}</p>
        </div>

        {/* 联系方式卡片区域 */}
        <div className="contact-cards">
          {linkData.contacts.map((contact) => (
            <Card key={contact.id} className="contact-card">
              <div className="card-header">
                <div
                  className="platform-icon"
                  style={{ backgroundColor: contact.color }}
                >
                  {contact.icon}
                </div>
                <Button
                  className="favorite-button"
                  icon={<StarOutlined />}
                  type="text"
                  onClick={() => handleFavorite(contact.id)}
                />
              </div>

              <div className="card-content">
                <h3 className="platform-name">{contact.platform}</h3>
                <p className="platform-nickname">{contact.nickname}</p>
              </div>

              <Button
                className="contact-button"
                type="primary"
                block
                onClick={() => handleContact(contact)}
              >
                联系
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinkDetailPage;