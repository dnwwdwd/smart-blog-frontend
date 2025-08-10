"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import FrontNavigationClientWrapper from '@/components/FrontNavigation/ClientWrapper';
import GlobalLoading from '@/components/GlobalLoading/page';
import './styles.css';


interface Props {
    children: React.ReactNode
}

export default function BasicLayout({children}: Props) {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
        // 模拟页面加载时间
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    // 显示全局加载效果
    if (!isClient || loading) {
        return <GlobalLoading loading={true}>{children}</GlobalLoading>;
    }

    // 判断是否为管理后台路径
    const isAdminPath = pathname.startsWith('/admin');

    if (isAdminPath) {
        return (
            <AdminLayout>
                {children}
            </AdminLayout>
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