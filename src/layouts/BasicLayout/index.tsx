"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import FrontNavigationClientWrapper from '@/components/FrontNavigation/ClientWrapper';
import GlobalLoading from '@/components/GlobalLoading';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import { useAuthStore } from '@/stores/authStore';
import './styles.css';


interface Props {
    children: React.ReactNode
}

function BasicLayoutContent({children}: Props) {
    const [isClient, setIsClient] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [initialProgress, setInitialProgress] = useState(0);
    const { isLoading, progress } = useLoading();
    const pathname = usePathname();
    const checkLogin = useAuthStore((state) => state.checkLogin);

    useEffect(() => {
        setIsClient(true);
        
        // 检查登录状态
        checkLogin();
        
        // 初始加载进度条更新
        const progressInterval = setInterval(() => {
            setInitialProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setInitialLoading(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
        
        return () => {
            clearInterval(progressInterval);
        };
    }, [checkLogin]);

    // 显示初始加载效果（仅阻塞首屏）
    if (!isClient || initialLoading) {
        return <GlobalLoading visible={true} progress={initialProgress} />;
    }

    // 判断是否为管理后台路径
    const isAdminPath = pathname.startsWith('/admin');
    // 判断是否为登录页面
    const isLoginPath = pathname === '/login';
    // 判断是否为文章发布页面（不显示导航栏）
    const isRepublishPath = pathname === '/admin/articles/create';

    let content: React.ReactNode;

    if (isRepublishPath) {
        content = (
            <div className="republish-layout">
                {children}
            </div>
        );
    } else if (isAdminPath) {
        content = (
            <AdminLayout>
                {children}
            </AdminLayout>
        );
    } else if (isLoginPath) {
        content = (
            <div className="login-layout">
                {children}
            </div>
        );
    } else {
        // 普通页面布局
        content = (
            <div className="basic-layout">
                <FrontNavigationClientWrapper />
                <main className="front-content">
                    {children}
                </main>
            </div>
        );
    }

    // 返回内容 + 过渡期的全局加载覆盖层（不阻塞子组件挂载）
    return (
        <>
            {isLoading && (
                <GlobalLoading visible={true} progress={progress} />
            )}
            {content}
        </>
    );
}

export default function BasicLayout({children}: Props) {
    return (
        <LoadingProvider>
            <BasicLayoutContent>{children}</BasicLayoutContent>
        </LoadingProvider>
    );
}