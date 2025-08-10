"use server";
import React from 'react';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import Sidebar from '@/components/Sidebar/page';
import TagCard, {Tag} from '@/components/TagCard/page';
import './styles.css';

const mockTags: Tag[] = [
    {
        id: 1,
        name: 'React',
        description: 'React是一个用于构建用户界面的JavaScript库，由Facebook开发和维护。',
        color: '#61dafb',
        articleCount: 45,
        followCount: 1280,
        icon: '⚛️'
    },
    {
        id: 2,
        name: 'TypeScript',
        description: 'TypeScript是JavaScript的超集，添加了静态类型定义，提高代码质量和开发效率。',
        color: '#3178c6',
        articleCount: 38,
        followCount: 956,
        icon: '📘'
    },
    {
        id: 3,
        name: 'Vue.js',
        description: 'Vue.js是一套用于构建用户界面的渐进式JavaScript框架。',
        color: '#4fc08d',
        articleCount: 32,
        followCount: 742,
        icon: '💚'
    },
    {
        id: 4,
        name: 'Node.js',
        description: 'Node.js是一个基于Chrome V8引擎的JavaScript运行时环境。',
        color: '#339933',
        articleCount: 28,
        followCount: 634,
        icon: '🟢'
    },
    {
        id: 5,
        name: 'Python',
        description: 'Python是一种高级编程语言，以其简洁的语法和强大的功能而闻名。',
        color: '#3776ab',
        articleCount: 52,
        followCount: 1456,
        icon: '🐍'
    },
    {
        id: 6,
        name: 'JavaScript',
        description: 'JavaScript是一种高级的、解释执行的编程语言，是Web开发的核心技术之一。',
        color: '#f7df1e',
        articleCount: 67,
        followCount: 1892,
        icon: '📜'
    },
    {
        id: 7,
        name: 'CSS',
        description: 'CSS是一种样式表语言，用于描述HTML或XML文档的呈现。',
        color: '#1572b6',
        articleCount: 34,
        followCount: 567,
        icon: '🎨'
    },
    {
        id: 8,
        name: 'Docker',
        description: 'Docker是一个开源的应用容器引擎，让开发者可以打包应用以及依赖包到一个轻量级、可移植的容器中。',
        color: '#2496ed',
        articleCount: 23,
        followCount: 445,
        icon: '🐳'
    },
    {
        id: 9,
        name: 'Kubernetes',
        description: 'Kubernetes是一个开源的容器编排平台，用于自动化部署、扩展和管理容器化应用程序。',
        color: '#326ce5',
        articleCount: 19,
        followCount: 378,
        icon: '☸️'
    },
    {
        id: 10,
        name: 'AI/ML',
        description: '人工智能和机器学习相关技术，包括深度学习、神经网络等前沿技术。',
        color: '#ff6b6b',
        articleCount: 41,
        followCount: 1123,
        icon: '🤖'
    }
];

export default async function TagsPage() {
    return (
        <div className="tags-page">
            <div className="container">
                <div className="tags-header mb-6">
                    <Title level={2}>🏷️ 标签列表</Title>
                    <Paragraph type="secondary">按技术标签浏览文章，快速找到感兴趣的内容</Paragraph>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <div className="tags-grid">
                            {mockTags.map((tag) => (
                                <TagCard key={tag.id} tag={tag}/>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <Sidebar/>
                    </div>
                </div>
            </div>
        </div>
    );
}