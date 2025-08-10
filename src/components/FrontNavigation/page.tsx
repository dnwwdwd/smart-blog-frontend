"use client";
import React, { useState, useEffect } from 'react';
import { Menu, Input, Button, Drawer } from 'antd';
import { SearchOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './styles.css';

interface FrontNavigationProps {
  currentPath?: string;
}

const FrontNavigation: React.FC<FrontNavigationProps> = ({ currentPath = '/' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 初始检查
    checkScreenSize();

    // 添加窗口大小变化监听器
    window.addEventListener('resize', checkScreenSize);

    // 清理监听器
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const menuItems = [
    { key: '/', label: '首页', href: '/' },
    { key: '/articles', label: '文章', href: '/articles' },
    { key: '/columns', label: '专栏', href: '/columns' },
    { key: '/tags', label: '标签', href: '/tags' },
    { key: '/links', label: '友链', href: '/links' },
    { key: '/about', label: '关于', href: '/about' },
  ];

  const handleMenuClick = (e: any) => {
    const item = menuItems.find(item => item.key === e.key);
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
              items={menuItems.map(item => ({
                key: item.key,
                label: item.label,
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
                />
              </div>
              <Button 
                type="text" 
                icon={<UserOutlined />} 
                className="user-button desktop-user"
              >
                登录
              </Button>
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
            items={menuItems.map(item => ({
              key: item.key,
              label: item.label,
            }))}
          />
          
          <div className="mobile-actions">
            <Input
              placeholder="搜索文章..."
              prefix={<SearchOutlined />}
              className="mobile-search"
            />
            <Button 
              type="primary" 
              icon={<UserOutlined />} 
              block
              className="mobile-login"
            >
              登录
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default FrontNavigation;