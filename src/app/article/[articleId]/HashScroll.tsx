"use client";
import { useEffect } from "react";

// 与页面 slugify 规则保持一致
function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s\-_]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// 添加CSS scroll-behavior样式
const addSmoothScrollStyle = () => {
  if (typeof document === "undefined") return;
  
  const style = document.createElement('style');
  style.textContent = `
    html {
      scroll-behavior: smooth;
    }
    
    /* 确保所有标题元素都有正确的scroll-margin */
    h1[id], h2[id], h3[id], h4[id], h5[id], h6[id] {
      scroll-margin-top: 80px;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
};

// 简单的滚动到hash位置函数
const scrollToHashElement = (hash: string) => {
  if (typeof window === "undefined") return;
  
  const decoded = decodeURIComponent(hash.slice(1));
  if (!decoded) return;

  const target = document.getElementById(decoded) || document.getElementById(slugify(decoded));
  
  if (target) {
    // 使用原生的scrollIntoView，让CSS处理平滑滚动
    target.scrollIntoView();
  }
};

// 拦截大纲点击事件
const handleTocClick = (e: Event) => {
  const target = e.target as HTMLElement;
  const anchor = target.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
  
  if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
    e.preventDefault();
    e.stopPropagation();
    
    const hash = anchor.getAttribute('href');
    if (hash) {
      window.history.pushState(null, "", hash);
      scrollToHashElement(hash);
    }
  }
};

export default function HashScroll() {
  useEffect(() => {
    // 添加平滑滚动样式
    const removeStyle = addSmoothScrollStyle();
    
    // 初始化时如果有hash，直接滚动
    if (typeof window !== "undefined" && window.location.hash) {
      // 延迟执行，确保DOM完全加载
      setTimeout(() => {
        scrollToHashElement(window.location.hash);
      }, 300);
    }
    
    // 为大纲添加点击事件代理
    const tocElement = document.querySelector('.custom-toc');
    if (tocElement) {
      tocElement.addEventListener('click', handleTocClick);
    }

    // 清理函数
    return () => {
      if (removeStyle) removeStyle();
      
      if (tocElement) {
        tocElement.removeEventListener('click', handleTocClick);
      }
    };
  }, []);

  return null;
}