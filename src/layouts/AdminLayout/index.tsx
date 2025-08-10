"use client";
import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  TagsOutlined,
  BookOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import './styles.css';

const { Header, Sider, Content } = Layout;

interface Props {
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

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
        },
        {
          key: '/admin/articles/create',
          label: <Link href="/admin/articles/create">创建文章</Link>,
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
        {/* 顶部触发器（仅在桌面端显示） */}
        <Header className="admin-header d-none d-lg-flex">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger"
          />
        </Header>



        <Content className="admin-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;