'use client';
import React from 'react';
import {Avatar, Card, Col, Progress, Row, Tag, Timeline} from 'antd';
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
  UserOutlined
} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import Text from 'antd/es/typography/Text';
import './styles.css';

const personalInfo = {
  name: '张洪Heo',
  title: '全栈开发工程师',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  location: '北京, 中国',
  email: 'zhanghong@example.com',
  github: 'https://github.com/zhanghong',
  linkedin: 'https://linkedin.com/in/zhanghong',
  twitter: 'https://twitter.com/zhanghong',
  bio: '热爱技术的全栈开发工程师，专注于现代Web开发技术栈。拥有5年以上的开发经验，擅长React、Node.js、TypeScript等技术。喜欢分享技术知识，致力于推动开源社区发展。',
  yearsOfExperience: 5,
  projectsCompleted: 50,
  articlesWritten: 120,
  githubStars: 2500
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
            </div>
          </div>
        </Card>
        
        {/* 统计数据 */}
        <Row gutter={[16, 16]} className="stats-section">
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-content">
                <CalendarOutlined className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-number">{personalInfo.yearsOfExperience}+</div>
                  <div className="stat-label">年经验</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-content">
                <CodeOutlined className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-number">{personalInfo.projectsCompleted}+</div>
                  <div className="stat-label">项目完成</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-content">
                <BookOutlined className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-number">{personalInfo.articlesWritten}+</div>
                  <div className="stat-label">技术文章</div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <div className="stat-content">
                <TrophyOutlined className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-number">{personalInfo.githubStars}+</div>
                  <div className="stat-label">GitHub Stars</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[24, 24]} className="content-section">
          {/* 个人历程 */}
          <Col xs={24} lg={12}>
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
          </Col>
          
          {/* 技能水平 */}
          <Col xs={24} lg={12}>
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
          </Col>
        </Row>
        
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
      </div>
    </div>
  );
}