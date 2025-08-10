"use client";
import React from 'react';
import {Row, Col, Typography, Card} from 'antd';
import FriendLinkCard from '@/components/FriendLinkCard/page';
import './styles.css';
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";


// 模拟友链数据
const friendLinks = [
    {
        id: 1,
        name: '白鲸_Cofcat',
        description: '你好，我叫白鲸，你也可以叫我Macon，我是一只猫猫，还是一个程序员。',
        avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face',
        url: 'https://example1.com',
        isSpecial: false,
        socialIcons: [
            { type: 'qq' as const, url: 'https://example.com/qq' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 2,
        name: '狼兽墨风',
        description: '一只代码里游泳的狼，是一只清爽LOvO',
        avatar: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face',
        url: 'https://example2.com',
        isSpecial: false,
        socialIcons: [
            { type: 'wechat' as const, url: 'https://example.com/wechat' }
        ]
    },
    {
        id: 3,
        name: '笑小白',
        description: '你好我是笑小白，教育家家小白，喜欢宅家',
        avatar: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=200&h=200&fit=crop&crop=face',
        url: 'https://example3.com',
        isSpecial: true,
        statusLabel: 'PREMIUM',
        socialIcons: [
            { type: 'qq' as const, url: 'https://example.com/qq' },
            { type: 'wechat' as const, url: 'https://example.com/wechat' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 4,
        name: '技术博客',
        description: '分享前端技术，记录学习心得',
        avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop&crop=face',
        url: 'https://example4.com',
        isSpecial: false,
        socialIcons: [
            { type: 'star' as const, url: 'https://example.com/github' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 5,
        name: '设计师小王',
        description: 'UI/UX设计师，热爱创意设计',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        url: 'https://example5.com',
        isSpecial: false,
        socialIcons: [
            { type: 'heart' as const, url: 'https://example.com/portfolio' },
            { type: 'star' as const, url: 'https://example.com/dribbble' }
        ]
    },
    {
        id: 6,
        name: '全栈开发者',
        description: '专注全栈开发，分享技术经验',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        url: 'https://example6.com',
        isSpecial: true,
        statusLabel: 'VIP',
        socialIcons: [
            { type: 'star' as const, url: 'https://example.com/github' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 7,
        name: '产品经理日记',
        description: '产品思维，用户体验，商业洞察',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        url: 'https://example7.com',
        isSpecial: false,
        socialIcons: [
            { type: 'qq' as const, url: 'https://example.com/qq' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 8,
        name: '算法工程师',
        description: '机器学习，深度学习，算法优化',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        url: 'https://example8.com',
        isSpecial: false,
        socialIcons: [
            { type: 'star' as const, url: 'https://example.com/github' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    },
    {
        id: 9,
        name: '开源爱好者',
        description: '热爱开源，贡献代码，分享知识',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
        url: 'https://example9.com',
        isSpecial: false,
        socialIcons: [
            { type: 'star' as const, url: 'https://example.com/github' },
            { type: 'heart' as const, url: 'https://example.com/blog' }
        ]
    }
];

export default function FriendsPage() {
    return (
        <div className="friends-page">
            <div className="container">
                {/* 页面头部 */}
                <div className="page-header">
                    <Title level={1} className="page-title">
                        友情链接
                    </Title>
                    <Paragraph className="page-description">
                        这里是我的朋友们，感谢他们在技术路上的陪伴与分享。
                        如果你也想加入我们，欢迎与我联系！
                    </Paragraph>
                </div>

                {/* 搜索框区域 */}
                <div className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="搜索友链...（支持搜索名称）"
                            className="search-input"
                        />
                    </div>
                </div>

                {/* 友链卡片网格 */}
                <div className="friends-grid">
                    <Row gutter={[24, 24]}>
                        {friendLinks.map((friend) => (
                            <Col
                                key={friend.id}
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                className="friend-col"
                            >
                                <FriendLinkCard
                                    id={friend.id}
                                    name={friend.name}
                                    description={friend.description}
                                    avatar={friend.avatar}
                                    url={friend.url}
                                    isSpecial={friend.isSpecial}
                                    statusLabel={friend.statusLabel}
                                    socialIcons={friend.socialIcons}
                                />
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* 申请友链区域 */}
                <div className="apply-section">
                    <Card className="apply-card">
                        <Title level={3} className="apply-title">
                            申请友链
                        </Title>
                        <Paragraph className="apply-description">
                            如果你也有优质的技术博客或网站，欢迎与我交换友链！
                        </Paragraph>
                        <div className="apply-requirements">
                            <h4>申请要求：</h4>
                            <ul>
                                <li>网站内容积极向上，无违法违规内容</li>
                                <li>技术类博客或个人网站优先</li>
                                <li>网站访问稳定，更新频率较高</li>
                                <li>支持 HTTPS 访问</li>
                            </ul>
                        </div>
                        <div className="contact-info">
                            <p><strong>联系方式：</strong></p>
                            <p>📧 邮箱：admin@example.com</p>
                            <p>💬 QQ：123456789</p>
                            <p>🐦 微博：@技术博主</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}