'use client';
import React from 'react';
import { Spin } from 'antd';
import './styles.css';

interface GlobalLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ loading, children }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className="global-loading-container">
      <div className="global-loading-content">
        <Spin size="large" />
        <div className="global-loading-text">
          页面加载中...
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;