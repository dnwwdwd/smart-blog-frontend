'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  startPageTransition: () => void;
  finishPageTransition: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      clearProgressInterval();
      setProgress(0);
    }
  };

  const startPageTransition = () => {
    // 避免重复启动
    clearProgressInterval();
    setIsLoading(true);
    setProgress(10); // 先展示一个初始值，避免 0% 不明显

    // 模拟页面加载进度，最多到 90%
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12 + 3; // 3 - 15 的增量
        return next >= 90 ? 90 : Math.floor(next);
      });
    }, 120);
  };

  const finishPageTransition = () => {
    // 完成并清理
    clearProgressInterval();
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 300);
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => clearProgressInterval();
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        progress,
        setLoading,
        setProgress,
        startPageTransition,
        finishPageTransition,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};