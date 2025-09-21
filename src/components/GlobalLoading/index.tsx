'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'antd';
import './styles.css';

export type FailureRenderInfo = {
  timeout: number;
  elapsed: number;
  onRetry: () => void;
};

interface GlobalLoadingProps {
  visible?: boolean; // 是否显示
  title?: string; // 标题
  subtitle?: string; // 副标题
  progress?: number; // 0-100，可选
  tips?: string[]; // 轮播提示语
  timeout?: number; // 超时时间（毫秒）
  onRetry?: () => void; // 点击重试回调
  onTimeout?: () => void; // 超时回调
  fullscreen?: boolean; // 是否全屏遮罩
  failureRender?: React.ReactNode | ((info: FailureRenderInfo) => React.ReactNode); // 自定义失败渲染
  className?: string;
  style?: React.CSSProperties;
}

const defaultTips = [
  '正在为你准备内容…',
  '优化资源加载…',
  '构建最佳阅读体验…',
];

const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  visible = true,
  title = 'Smart Blog',
  subtitle = '页面加载中，请稍候',
  progress,
  tips = defaultTips,
  timeout = 30000,
  onRetry,
  onTimeout,
  fullscreen = true,
  failureRender,
  className,
  style,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsTimeout(false);
    setElapsed(0);
    startRef.current = Date.now();

    const tick = setInterval(() => {
      const e = Date.now() - (startRef.current || Date.now());
      setElapsed(e);
      if (e >= timeout) {
        setIsTimeout(true);
        clearInterval(tick);
        onTimeout?.();
      }
    }, 250);

    const tipTimer: any = tips.length > 0 ? setInterval(() => {
      setTipIndex((i) => (i + 1) % (tips.length || 1));
    }, 2000) : null;

    return () => {
      clearInterval(tick);
      if (tipTimer) clearInterval(tipTimer);
    };
  }, [visible, timeout, tips.length, onTimeout]);

  const handleRetry = () => {
    onRetry ? onRetry() : window.location.reload();
  };

  const failureNode = useMemo(() => {
    const info: FailureRenderInfo = { timeout, elapsed, onRetry: handleRetry };
    if (typeof failureRender === 'function') return (failureRender as (i: FailureRenderInfo) => React.ReactNode)(info);
    if (failureRender) return failureRender;
    return (
      <div className="gl-fail">
        <div className="gl-fail-icon" aria-hidden>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" stroke="var(--gl-primary)" strokeWidth="2" opacity=".25"/>
            <path d="M22 22l20 20M42 22L22 42" stroke="var(--gl-primary)" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="gl-title">加载失败</div>
        <div className="gl-sub">已等待超过 {Math.round(timeout/1000)} 秒，请检查网络或稍后重试。</div>
        <div className="gl-actions">
          <Button type="primary" onClick={handleRetry}>重试</Button>
          <Button onClick={() => (window.location.href = '/')}>返回首页</Button>
        </div>
      </div>
    );
  }, [failureRender, timeout, elapsed]);

  if (!visible) return null;

  if (isTimeout) {
    return (
      <div className={`gl-overlay ${fullscreen ? 'gl-fullscreen' : ''} ${className || ''}`} style={style}>
        <div className="gl-card">
          {failureNode}
        </div>
      </div>
    );
  }

  const percent = typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div className={
      `gl-overlay ${fullscreen ? 'gl-fullscreen' : ''} ${className || ''}`
    } style={style}>
      <div className="gl-card" role="status" aria-live="polite">
        <div className="gl-spinner" aria-hidden>
          <div className="gl-spinner-ring"/>
          <div className="gl-logo">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" stroke="var(--gl-primary)" strokeWidth="2" opacity=".6"/>
              <path d="M16 24h16M16 28h10M16 20h12" stroke="var(--gl-primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="gl-title">{title}</div>
        <div className="gl-sub">{subtitle}</div>

        <div className="gl-progress">
          <div className={`gl-bar ${percent === undefined ? 'gl-indeterminate' : ''}`}
               style={percent !== undefined ? ({ ['--gl-p' as any]: `${percent}%` }) : undefined}
          />
          <div className="gl-progress-text">
            {percent !== undefined ? `已加载 ${percent}%` : tips[tipIndex]}
          </div>
        </div>

        {elapsed > 10000 && (
          <div className="gl-hint">加载时间较长，请耐心等待…</div>
        )}
      </div>
    </div>
  );
};

export default GlobalLoading;