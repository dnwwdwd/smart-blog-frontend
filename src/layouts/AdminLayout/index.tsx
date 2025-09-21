"use client";
import React, { useState, useEffect } from "react";
import { Drawer, Layout, Menu, message } from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  OpenAIOutlined,
  LinkOutlined,
  PlusOutlined,
  SettingOutlined,
  TagsOutlined,
  UploadOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { useFetchSiteSettings } from "@/stores/siteSettingsStore";
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
  
  const { isLoggedIn, checkLogin } = useAuthStore();
  const fetchSiteSettings = useFetchSiteSettings();
  
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
  
  useEffect(() => {
    if (checking) return;
    if (!isLoggedIn) {
      message.warning("您还未登录");
      router.push("/login");
    } else {
      // 登录通过后拉取站点设置
      fetchSiteSettings();
    }
  }, [checking, isLoggedIn, router, fetchSiteSettings]);
  
  if (checking || !isLoggedIn) {
    return null;
  }

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">仪表盘</Link>,
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
      key: '/admin/comments',
      icon: <CommentOutlined />,
      label: <Link href="/admin/comments">评论管理</Link>,
    },
    {
      key: '/admin/friend-link',
      icon: <LinkOutlined />,
      label: <Link href="/admin/friend-link">友链管理</Link>,
    },
    {
      key: '/admin/ai-chat',
      icon: <OpenAIOutlined />,
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