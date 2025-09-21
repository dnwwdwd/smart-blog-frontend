"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/layouts/AdminLayout';
import FrontNavigationClientWrapper from '@/components/FrontNavigation/ClientWrapper';
import GlobalLoading from '@/components/GlobalLoading';
import { LoadingProvider, useLoading } from '@/contexts/LoadingContext';
import { useAuthStore } from '@/stores/authStore';
import { useFetchSiteSettings, useSiteSettings } from '@/stores/siteSettingsStore';
import './styles.css';
import AIChatModal from '@/components/AIChatModal';
// removed unused import

interface Props { children: React.ReactNode }

function BasicLayoutContent({children}: Props) {
    const [isClient, setIsClient] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [initialProgress, setInitialProgress] = useState(0);
    const { isLoading, progress } = useLoading();
    const pathname = usePathname();
    const checkLogin = useAuthStore((state) => state.checkLogin);

    const settings = useSiteSettings();
    const fetchSiteSettings = useFetchSiteSettings();
    const [aiOpen, setAiOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        checkLogin();
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
        return () => { clearInterval(progressInterval); };
    }, [checkLogin]);

    // 在前台路径拉取站点设置
    useEffect(() => {
        const isAdminPath = pathname.startsWith('/admin');
        if (!isAdminPath) {
          fetchSiteSettings();
        }
    }, [pathname, fetchSiteSettings]);

    // 绑定全局快捷键打开/关闭 AI 弹窗（跨系统适配 Ctrl/Cmd、Alt/Option）
    useEffect(() => {
      const shortcut = String((settings as any)?.aiChatShortcut || 'Alt+K');

      const ctrlAliases = ['ctrl', 'control', '⌃'];
      const metaAliases = ['meta', 'cmd', 'command', '⌘'];
      const altAliases = ['alt', 'option', 'opt', '⌥'];
      const shiftAliases = ['shift', '⇧'];

      function parseShortcut(input: string) {
        const tokens = input.split('+').map(t => t.trim()).filter(Boolean);
        let needAlt = false;
        let needCtrlOrMeta = false; // 跨平台：Ctrl 或 Cmd 任一满足
        let needShift = false;
        let mainKey = '';

        for (const raw of tokens) {
          const t = raw.toLowerCase();
          if (altAliases.includes(t)) { needAlt = true; continue; }
          if (shiftAliases.includes(t)) { needShift = true; continue; }
          if (ctrlAliases.includes(t) || metaAliases.includes(t)) { needCtrlOrMeta = true; continue; }
          // 第一个非修饰键作为主键
          if (!mainKey) mainKey = raw.toLowerCase();
        }
        // 兜底：若未解析出主键且最后一个 token 存在，则取最后一个
        if (!mainKey && tokens.length) {
          const last = tokens[tokens.length - 1];
          const lastLower = last.toLowerCase();
          if (!altAliases.includes(lastLower) && !shiftAliases.includes(lastLower) && !ctrlAliases.includes(lastLower) && !metaAliases.includes(lastLower)) {
            mainKey = lastLower;
          }
        }
        return { needAlt, needCtrlOrMeta, needShift, mainKey };
      }

      const req = parseShortcut(shortcut);

      const handler = (e: KeyboardEvent) => {
        // 严格匹配：仅当需要的修饰键为 true，且未声明的修饰键为 false
        const altOk = req.needAlt ? e.altKey : !e.altKey;
        const ctrlMetaPressed = e.ctrlKey || e.metaKey; // Mac 下 ⌘ 也可匹配 Ctrl 需求
        const ctrlOk = req.needCtrlOrMeta ? ctrlMetaPressed : !ctrlMetaPressed;
        const shiftOk = req.needShift ? e.shiftKey : !e.shiftKey;
        const mainOk = req.mainKey ? e.key.toLowerCase() === req.mainKey : false;
        if (altOk && ctrlOk && shiftOk && mainOk) {
          e.preventDefault();
          setAiOpen((v) => !v);
        }
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [settings]);

    const seo = useMemo(() => {
      const title = settings?.siteName || 'Smart Blog';
      const description = settings?.seoDescription || settings?.siteDescription || '一个智能的博客系统';
      const keywords = settings?.seoKeywords || settings?.siteKeywords || '博客,技术,分享,学习';
      const siteName = settings?.siteName || 'Smart Blog';
      const favicon = settings?.favicon;
      return { title, description, keywords, siteName, favicon };
    }, [settings]);

    if (!isClient || initialLoading) {
        return <GlobalLoading visible={true} progress={initialProgress} title={settings?.siteName || 'Smart Blog'} subtitle={settings?.siteDescription || '页面加载中，请稍候'} />;
    }

    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPath = pathname === '/login';
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
        content = (
            <div className="basic-layout">
                <FrontNavigationClientWrapper />
                <main className="front-content">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <>
            {/* SEO 注入 */}
            <Head>
              <title>{seo.title}</title>
              <meta name="description" content={seo.description} />
              <meta name="keywords" content={seo.keywords} />

              {/* Open Graph */}
              <meta property="og:type" content="website" />
              <meta property="og:locale" content="zh_CN" />
              <meta property="og:url" content="/" />
              <meta property="og:title" content={seo.title} />
              <meta property="og:description" content={seo.description} />
              <meta property="og:site_name" content={seo.siteName} />

              {/* Twitter */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content={seo.title} />
              <meta name="twitter:description" content={seo.description} />

              {/* Favicon */}
              {seo.favicon && <link rel="icon" href={seo.favicon} />}
            </Head>

            {isLoading && (
                <GlobalLoading visible={true} progress={progress} title={settings?.siteName || 'Smart Blog'} subtitle={settings?.siteDescription || '页面加载中，请稍候'} />
            )}
            {content}
            <AIChatModal open={aiOpen} onClose={() => setAiOpen(false)} />
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