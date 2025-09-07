"use client";
import React, { useState, useEffect } from "react";
import { Menu, Input, Button, Drawer, Avatar, Dropdown } from "antd";
import { SearchOutlined, UserOutlined, MenuOutlined, LogoutOutlined, CrownOutlined,HomeOutlined,FileSearchOutlined,TagsOutlined,InfoCircleOutlined,LinkOutlined,BookOutlined  } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/authStore";
import SearchModal from "@/components/SearchModal";
import "./styles.css";

interface FrontNavigationProps {
  currentPath?: string;
}

const FrontNavigation: React.FC<FrontNavigationProps> = ({
  currentPath = "/",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  // 处理登出
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始检查
    checkScreenSize();

    // 添加窗口大小变化监听器
    window.addEventListener("resize", checkScreenSize);

    // 清理监听器
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const menuItems = [
    { key: "/", label: "首页", href: "/", icon: <HomeOutlined /> },
    { key: "/articles", label: "文章", href: "/articles", icon: <FileSearchOutlined /> },
    { key: "/columns", label: "专栏", href: "/columns", icon: <BookOutlined /> },
    { key: "/tags", label: "标签", href: "/tags", icon: <TagsOutlined /> },
    { key: "/links", label: "友链", href: "/links", icon: <LinkOutlined /> },
    { key: "/about", label: "关于", href: "/about", icon: <InfoCircleOutlined /> },
  ];

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: 'admin',
      label: '后台管理',
      icon: <CrownOutlined />,
      onClick: () => router.push('/admin'),
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    }
  ];

  const handleMenuClick = (e: any) => {
    const item = menuItems.find((item) => item.key === e.key);
    if (item) {
      router.push(item.href);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="front-navigation">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link href="/">
            <span className="logo-text">智能博客</span>
          </Link>
        </div>

        {/* 桌面端菜单 */}
        {!isMobile && (
          <div className="desktop-menu">
            <Menu
              mode="horizontal"
              selectedKeys={[currentPath]}
              onClick={handleMenuClick}
              className="nav-menu"
              items={menuItems.map((item) => ({
                key: item.key,
                label: item.label,
                icon: item.icon,
              }))}
            />
          </div>
        )}

        {/* 操作区域 */}
        <div className="nav-actions">
          {!isMobile && (
            <>
              <div className="search-container desktop-search">
                <Input
                  placeholder="搜索文章..."
                  prefix={<SearchOutlined />}
                  className="search-input"
                  onClick={() => setSearchModalVisible(true)}
                  onPressEnter={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    setSearchKeyword(value);
                    setSearchModalVisible(true);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              {isLoggedIn ? (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <div className="user-info-container">
                    <Avatar
                      src={user?.userAvatar}
                      icon={<UserOutlined />}
                      size={32}
                      className="user-avatar"
                    />
                    <span className="user-name">{user?.username}</span>
                  </div>
                </Dropdown>
              ) : (
                <Link href="/login">
                  <Button
                    type="text"
                    icon={<UserOutlined />}
                    className="user-button desktop-user"
                  >
                    登录
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* 移动端菜单按钮 */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-button"
            />
          )}
        </div>
      </div>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title="菜单"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-drawer"
        width={280}
      >
        <div className="mobile-menu-content">
          <Menu
            mode="vertical"
            selectedKeys={[currentPath]}
            onClick={handleMenuClick}
            className="mobile-nav-menu"
            items={menuItems.map((item) => ({
              key: item.key,
              label: item.label,
              icon: item.icon,
            }))}
          />

          <div className="mobile-actions">
            <Input
              placeholder="搜索文章..."
              prefix={<SearchOutlined />}
              className="mobile-search"
            />
            {isLoggedIn ? (
              <div className="mobile-user-info">
                <div className="mobile-user-profile">
                  <Avatar
                    src={user?.userAvatar}
                    icon={<UserOutlined />}
                    size={40}
                    className="mobile-user-avatar"
                  />
                  <span className="mobile-user-name">{user?.username}</span>
                </div>
                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  block
                  className="mobile-logout"
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  block
                  className="mobile-login"
                >
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Drawer>

      {/* 搜索模态框 */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        defaultKeyword={searchKeyword}
      />
    </header>
  );
};

export default FrontNavigation;
