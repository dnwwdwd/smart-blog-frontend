'use client';
import React from 'react';
import { StarOutlined, HeartOutlined, QqOutlined, WechatOutlined, GithubOutlined, XOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './styles.css';

interface FriendLinkCardProps {
  id: number;
  name: string;
  description: string;
  avatar: string;
  url: string;
  isSpecial?: boolean;
  statusLabel?: string;
  socialIcons?: Array<{
    type: 'qq' | 'wechat' | 'heart' | 'star' | 'github' | 'x' | 'website' | 'email';
    url?: string;
  }>;
}

const FriendLinkCard: React.FC<FriendLinkCardProps> = ({
  id,
  name,
  description,
  avatar,
  url,
  isSpecial = false,
  statusLabel,
  socialIcons = []
}) => {
  const router = useRouter();

  const handleSocialClick = (e: React.MouseEvent, socialUrl?: string) => {
    e.stopPropagation();
    if (socialUrl) {
      window.open(socialUrl, '_blank');
    }
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if ((event.metaKey || event.ctrlKey) && url) {
      event.stopPropagation();
      window.open(url, "_blank");
      return;
    }
    router.push(`/link/${id}`);
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'qq':
        return <QqOutlined />;
      case 'wechat':
        return <WechatOutlined />;
      case 'heart':
        return <HeartOutlined />;
      case 'star':
        return <StarOutlined />;
      case 'github':
        return <GithubOutlined />;
      case 'x':
        return <XOutlined />;
      case 'email':
        return <MailOutlined />;
      case 'website':
        return <LinkOutlined />;
      default:
        return <StarOutlined />;
    }
  };

  const hasStatus = Boolean(statusLabel);

  return (
    <div 
      className={`friend-link-card ${isSpecial ? 'special' : ''} ${hasStatus ? 'has-status' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* 状态标签 */}
      {statusLabel && (
        <div className="status-label">
          ★ {statusLabel}
        </div>
      )}
      
      {/* 头像区域 */}
      <div className="avatar-section">
        <div className="avatar-container">
          <Image src={avatar} alt={name} width={72} height={72} className="friend-avatar" unoptimized />
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="card-content">
        <div className="friend-name">{name}</div>
        <div className="friend-description">{description}</div>
      </div>
      
      {/* 社交图标区域 */}
      {socialIcons.length > 0 && (
        <div className="social-icons">
          {socialIcons.map((social, index) => (
            <div 
              key={index}
              className="social-icon"
              onClick={(e) => handleSocialClick(e, social.url)}
            >
              {getSocialIcon(social.type)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendLinkCard;
