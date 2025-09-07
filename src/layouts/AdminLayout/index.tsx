"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Layout, Menu, message } from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ImportOutlined,
  LinkOutlined,
  PlusOutlined,
  SettingOutlined,
  TagsOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import "./styles.css";
import "@ant-design/v5-patch-for-react-19";

const { Header, Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  
  // 获取登录状态
  const { isLoggedIn, checkLogin } = useAuthStore();
  
  // 登录验证逻辑：在挂载时先向后端校验一次会话
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        await checkLogin();
      } finally {
        if (!ignore) setChecking(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [checkLogin]);
  
  // 根据状态跳转
  useEffect(() => {
    if (checking) return; // 等待检查完成
    if (!isLoggedIn) {
      message.warning("您还未登录");
      router.push("/login");
    }
  }, [checking, isLoggedIn, router]);
  
  // 如果未登录或正在检查，不渲染后台内容
  if (checking || !isLoggedIn) {
    return null;
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">仪表盘</Link>,
    },
    {
      key: 'articles',
      icon: <FileTextOutlined />,
      label: '文章管理',
      children: [
        {
          key: '/admin/articles',
          label: <Link href="/admin/articles">文章列表</Link>,
          icon: <BookOutlined />,
        },
        {
          key: '/admin/articles/create',
          label: <Link href="/admin/articles/create">新建文章</Link>,
          icon: <PlusOutlined />,
        },
        {
          key: '/admin/articles/upload',
          label: <Link href="/admin/articles/upload">上传文章</Link>,
          icon: <UploadOutlined />,
        },
      ],
    },
    {
      key: '/admin/tags',
      icon: <TagsOutlined />,
      label: <Link href="/admin/tags">标签管理</Link>,
    },
    {
      key: '/admin/columns',
      icon: <BookOutlined />,
      label: <Link href="/admin/columns">专栏管理</Link>,
    },
        {
      key: '/admin/friend-link',
      icon: <LinkOutlined />,
      label: <Link href="/admin/friend-link">友链管理</Link>,
    },
    {
      key: '/admin/ai-chat',
      icon: <ImportOutlined />,
      label: <Link href="/admin/ai-chat">AI 聊天</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">系统设置</Link>,
    },
  ];

  const sidebarContent = (
    <>
      <div className="admin-logo">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          width={28}
          height={28}
          className="logo"
        />
        {!collapsed && <span className="admin-title">后台管理</span>}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={['articles']}
        items={menuItems}
        className="side-menu"
      />
    </>
  );

  return (
    <Layout className="admin-layout">
      {/* 桌面端侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={80}
        className="side-navigation d-none d-lg-block"
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        {sidebarContent}
      </Sider>

      {/* 移动端抽屉 */}
      <Drawer
        title="后台管理"
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        className="mobile-drawer d-lg-none"
        width={250}
        styles={{ body: { padding: 0 } }}
      >
        {sidebarContent}
      </Drawer>

      <Layout>
        
        <Content className="admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;