'use client';
import React from 'react';
import { StarOutlined, HeartOutlined, QqOutlined, WechatOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
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
    type: 'qq' | 'wechat' | 'heart' | 'star';
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

  const handleCardClick = () => {
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
      default:
        return <StarOutlined />;
    }
  };

  return (
    <div 
      className={`friend-link-card ${isSpecial ? 'special' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* 状态标签 */}
      {statusLabel && (
        <div className="status-label">
          ★ {statusLabel}
        </div>
      )}
      
      {/* 右上角收藏图标 */}
      <div className="corner-icon">
        <StarOutlined />
      </div>
      
      {/* 头像区域 */}
      <div className="avatar-section">
        <div className="avatar-container">
          <img src={avatar} alt={name} className="friend-avatar" />
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