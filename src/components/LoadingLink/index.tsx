'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

interface LoadingLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LoadingLink: React.FC<LoadingLinkProps> = ({
  href,
  children,
  className,
  style,
  replace = false,
  scroll = true,
  prefetch = true,
  onClick,
  ...props
}) => {
  const router = useRouter();
  const { startPageTransition } = useLoading();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 先调用外部传入的onClick
    if (onClick) {
      onClick(e);
    }

    // 检查是否是外部链接或特殊键按下
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      return; // 让默认行为处理
    }

    e.preventDefault();
    
    // 启动页面过渡动画
    startPageTransition();
    
    // 执行路由跳转
    if (replace) {
      router.replace(href, { scroll });
    } else {
      router.push(href, { scroll });
    }
  };

  return (
    <Link
      href={href}
      className={className}
      style={style}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LoadingLink;