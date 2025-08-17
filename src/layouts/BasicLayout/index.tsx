"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import FrontNavigationClientWrapper from '@/components/FrontNavigation/ClientWrapper';
import GlobalLoading from '@/components/GlobalLoading';
import './styles.css';


interface Props {
    children: React.ReactNode
}

export default function BasicLayout({children}: Props) {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
        
        // 模拟进度条更新
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setLoading(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
        
        return () => {
            clearInterval(progressInterval);
        };
    }, []);

    // 显示全局加载效果
    if (!isClient || loading) {
        return <GlobalLoading visible={true} progress={progress} />;
    }

    // 判断是否为管理后台路径
    const isAdminPath = pathname.startsWith('/admin');
    // 判断是否为登录页面
    const isLoginPath = pathname === '/login';
    // 判断是否为文章发布页面（不显示导航栏）
    const isRepublishPath = pathname === '/admin/articles/create';

    if (isRepublishPath) {
        return (
            <div className="republish-layout">
                {children}
            </div>
        );
    }

    if (isAdminPath) {
        return (
            <AdminLayout>
                {children}
            </AdminLayout>
        );
    }

    // 登录页面布局（不显示导航栏）
    if (isLoginPath) {
        return (
            <div className="login-layout">
                {children}
            </div>
        );
    }

    // 普通页面布局
    return (
        <div className="basic-layout">
            <FrontNavigationClientWrapper />
            <main className="front-content">
                {children}
            </main>
        </div>
    );
}