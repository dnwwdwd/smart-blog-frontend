'use client';

import React from 'react';
import { Progress } from 'antd';
import './styles.css';

interface GlobalLoadingProps {
  visible?: boolean;
  progress?: number;
  title?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  visible = false,
  progress = 0,
  title = 'Smart Blog'
}) => {
  if (!visible) return null;

  return (
    <div className="global-loading-overlay">
      <div className="global-loading-container">
        {/* 网站图标 */}
        <div className="loading-icon">
          <div className="icon-animation">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="site-icon"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#1890ff"
                size="3"
                fill="none"
                className="icon-circle"
              />
              <path
                d="M20 28h24M20 32h20M20 36h16"
                stroke="#1890ff"
                size="2.5"
                strokeLinecap="round"
                className="icon-lines"
              />
              <circle
                cx="32"
                cy="20"
                r="3"
                fill="#1890ff"
                className="icon-dot"
              />
            </svg>
          </div>
        </div>

        {/* 网站标题 */}
        <h1 className="loading-title">{title}</h1>

        {/* 加载动画 */}
        <div className="loading-animation">
          <div className="loading-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
          </div>
        </div>

        {/* 加载进度条 */}
        <div className="loading-progress">
          <Progress
            percent={progress}
            strokeColor={{
              '0%': '#1890ff',
              '100%': '#52c41a',
            }}
            trailColor="rgba(255, 255, 255, 0.1)"
            size={6}
            showInfo={false}
            className="progress-bar"
          />
          <div className="progress-text">
            {progress < 100 ? `加载中... ${progress}%` : '加载完成'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;