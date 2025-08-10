"use server";
import React from 'react';
import Title from 'antd/es/typography/Title';
import Paragraph from 'antd/es/typography/Paragraph';
import Sidebar from '@/components/Sidebar/page';
import ColumnCard, {Column} from '@/components/ColumnCard/page';
import './styles.css';

const mockColumns: Column[] = [
    {
        id: 1,
        title: '前端开发实战',
        description: '从基础到进阶，全面掌握现代前端开发技术栈，包括React、Vue、TypeScript等热门技术。',
        coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
        author: '张洪Heo',
        createDate: '2024-01-15',
        articleCount: 12,
        viewCount: 2580,
        tags: ['React', 'TypeScript', 'JavaScript']
    },
    {
        id: 2,
        title: 'UI/UX设计指南',
        description: '深入探讨用户界面和用户体验设计的核心原则，分享实用的设计技巧和工具使用方法。',
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
        author: '李设计',
        createDate: '2024-02-01',
        articleCount: 8,
        viewCount: 1920,
        tags: ['UI设计', 'UX设计', 'Figma']
    },
    {
        id: 3,
        title: '后端架构设计',
        description: '系统性学习后端架构设计模式，包括微服务、分布式系统、数据库设计等核心概念。',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
        author: '王架构',
        createDate: '2024-01-20',
        articleCount: 15,
        viewCount: 3240,
        tags: ['架构设计', '微服务', 'Spring Boot']
    },
    {
        id: 4,
        title: '移动端开发',
        description: '涵盖iOS、Android原生开发以及React Native、Flutter等跨平台开发技术。',
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
        author: '陈移动',
        createDate: '2024-02-10',
        articleCount: 10,
        viewCount: 1850,
        tags: ['React Native', 'Flutter', 'iOS']
    },
    {
        id: 5,
        title: '数据科学入门',
        description: '从零开始学习数据科学，包括Python、机器学习、数据可视化等核心技能。',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        author: '刘数据',
        createDate: '2024-01-25',
        articleCount: 18,
        viewCount: 4120,
        tags: ['Python', '机器学习', '数据分析']
    },
    {
        id: 6,
        title: 'DevOps实践',
        description: '学习现代DevOps工具链和最佳实践，包括Docker、Kubernetes、CI/CD等。',
        coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=250&fit=crop',
        author: '周运维',
        createDate: '2024-02-05',
        articleCount: 14,
        viewCount: 2760,
        tags: ['Docker', 'Kubernetes', 'CI/CD']
    }
];

export default async function ColumnsPage() {
    return (
        <div className="columns-page">
            <div className="container">
                <div className="columns-header mb-6">
                    <Title level={2}>📚 专栏列表</Title>
                    <Paragraph type="secondary">系统化学习，深度掌握技术</Paragraph>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 主内容区 - 3/4宽度 */}
                    <div className="lg:col-span-3">
                        <div className="columns-grid">
                            {mockColumns.map((column) => (
                                <ColumnCard key={column.id} column={column}/>
                            ))}
                        </div>
                    </div>

                    {/* 侧边栏 - 1/4宽度 */}
                    <div className="lg:col-span-1">
                        <Sidebar/>
                    </div>
                </div>
            </div>
        </div>
    );
}