'use client';
import React from 'react';
import {Avatar, Card, Col, Progress, Row, Tag, Timeline, Button, Space, Statistic} from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CodeOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
  MailOutlined,
  TrophyOutlined,
  TwitterOutlined,
  UserOutlined,
  FileTextOutlined,
  EyeOutlined,
  TagsOutlined,
  HeartOutlined,
  RocketOutlined
} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import Text from 'antd/es/typography/Text';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/page';
import './styles.css';

const personalInfo = {
  name: '张洪Heo',
  title: '全栈开发工程师 & 技术博主',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  location: '北京, 中国',
  email: 'zhanghong@example.com',
  github: 'https://github.com/zhanghong',
  linkedin: 'https://linkedin.com/in/zhanghong',
  twitter: 'https://twitter.com/zhanghong',
  bio: '热爱技术的全栈开发工程师，专注于现代Web开发技术栈。通过这个智能博客平台分享技术见解，记录学习历程。拥有5年以上的开发经验，擅长React、Node.js、TypeScript等技术。致力于推动开源社区发展，帮助更多开发者成长。',
  yearsOfExperience: 5,
  projectsCompleted: 50,
  articlesWritten: 120,
  githubStars: 2500,
  blogViews: 500000,
  followers: 1200
};

// 博客统计数据
const blogStats = {
  totalArticles: 156,
  totalColumns: 12,
  totalTags: 45,
  totalViews: 500000,
  monthlyViews: 25000,
  followers: 1200
};

const timeline = [
  {
    time: '2024年1月 - 至今',
    title: '高级全栈开发工程师',
    company: '字节跳动',
    description: '负责核心业务系统的架构设计和开发，带领团队完成多个重要项目的交付。'
  },
  {
    time: '2022年3月 - 2023年12月',
    title: '全栈开发工程师',
    company: '腾讯',
    description: '参与微信小程序生态建设，开发了多个高并发的后端服务和前端应用。'
  },
  {
    time: '2020年6月 - 2022年2月',
    title: '前端开发工程师',
    company: '阿里巴巴',
    description: '负责淘宝商家后台系统的前端开发，优化用户体验和系统性能。'
  },
  {
    time: '2019年7月 - 2020年5月',
    title: '初级前端开发工程师',
    company: '美团',
    description: '参与美团外卖商家端的开发工作，学习并掌握了现代前端开发技术栈。'
  },
  {
    time: '2015年9月 - 2019年6月',
    title: '计算机科学与技术学士',
    company: '清华大学',
    description: '主修计算机科学与技术，GPA 3.8/4.0，获得优秀毕业生称号。'
  }
];

const skills = [
  { name: 'JavaScript/TypeScript', level: 95, color: '#f7df1e' },
  { name: 'React/Next.js', level: 90, color: '#61dafb' },
  { name: 'Vue.js/Nuxt.js', level: 85, color: '#4fc08d' },
  { name: 'Node.js/Express', level: 88, color: '#339933' },
  { name: 'Python/Django', level: 80, color: '#3776ab' },
  { name: 'Docker/Kubernetes', level: 75, color: '#2496ed' },
  { name: 'AWS/云服务', level: 70, color: '#ff9900' },
  { name: 'MongoDB/MySQL', level: 82, color: '#47a248' }
];

const achievements = [
  '🏆 2023年度最佳员工',
  '📝 技术博客累计阅读量100万+',
  '⭐ GitHub开源项目获得2500+ Stars',
  '🎤 多次在技术大会上分享经验',
  '👥 指导10+名初级开发者成长',
  '🚀 主导完成5个大型项目'
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        <Row gutter={[24, 24]}>
          {/* 主要内容区域 */}
          <Col xs={24} lg={16}>
            {/* 个人信息卡片 */}
            <Card className="profile-card">
              <div className="profile-header">
                <Avatar 
                  size={120} 
                  src={personalInfo.avatar}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <Title level={2} className="profile-name">
                    {personalInfo.name}
                  </Title>
                  <Text className="profile-title">
                    {personalInfo.title}
                  </Text>
                  <Paragraph className="profile-bio">
                    {personalInfo.bio}
                  </Paragraph>
                  
                  <div className="profile-contact">
                    <div className="contact-item">
                      <EnvironmentOutlined />
                      <span>{personalInfo.location}</span>
                    </div>
                    <div className="contact-item">
                      <MailOutlined />
                      <span>{personalInfo.email}</span>
                    </div>
                  </div>
                  
                  <div className="social-links">
                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                      <GithubOutlined />
                    </a>
                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                      <LinkedinOutlined />
                    </a>
                    <a href={personalInfo.twitter} target="_blank" rel="noopener noreferrer">
                      <TwitterOutlined />
                    </a>
                  </div>
                  
                  <div className="profile-actions">
                    <Space>
                      <Link href="/articles">
                        <Button type="primary" icon={<FileTextOutlined />}>
                          查看文章
                        </Button>
                      </Link>
                      <Link href="/columns">
                        <Button icon={<BookOutlined />}>
                          浏览专栏
                        </Button>
                      </Link>
                    </Space>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* 博客统计 */}
            <Card className="blog-stats-card">
              <Title level={3} className="section-title">
                📊 博客数据统计
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="文章总数"
                    value={blogStats.totalArticles}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="专栏数量"
                    value={blogStats.totalColumns}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="标签数量"
                    value={blogStats.totalTags}
                    prefix={<TagsOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="总浏览量"
                    value={blogStats.totalViews}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
              </Row>
            </Card>
            
            {/* 个人历程 */}
            <Card className="timeline-card">
              <Title level={3} className="section-title">
                📚 个人历程
              </Title>
              <Timeline 
                className="custom-timeline"
                items={timeline.map((item, index) => ({
                  key: index,
                  children: (
                    <div className="timeline-content">
                      <Text className="timeline-time">{item.time}</Text>
                      <Title level={5} className="timeline-title">
                        {item.title}
                      </Title>
                      <Text className="timeline-company">{item.company}</Text>
                      <Paragraph className="timeline-description">
                        {item.description}
                      </Paragraph>
                    </div>
                  )
                }))}
              />
            </Card>
            
            {/* 技能水平 */}
            <Card className="skills-card">
              <Title level={3} className="section-title">
                💻 技能水平
              </Title>
              <div className="skills-list">
                {skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-header">
                      <Text className="skill-name">{skill.name}</Text>
                      <Text className="skill-percentage">{skill.level}%</Text>
                    </div>
                    <Progress 
                      percent={skill.level} 
                      strokeColor={skill.color}
                      showInfo={false}
                      className="skill-progress"
                    />
                  </div>
                ))}
              </div>
            </Card>
            
            {/* 成就与荣誉 */}
            <Card className="achievements-card">
              <Title level={3} className="section-title">
                🏆 成就与荣誉
              </Title>
              <div className="achievements-list">
                {achievements.map((achievement, index) => (
                  <Tag key={index} className="achievement-tag">
                    {achievement}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
          
          {/* 侧边栏 */}
          <Col xs={24} lg={8}>
            <Sidebar />
          </Col>
        </Row>
      </div>
    </div>
  );
}