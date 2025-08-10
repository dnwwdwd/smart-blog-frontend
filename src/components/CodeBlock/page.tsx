'use client';
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import './styles.css';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, language }) => {
  const [copied, setCopied] = useState(false);
  
  // 提取代码内容
  const getCodeContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (React.isValidElement(node)) {
      if ((node.props as any).children) {
        return getCodeContent((node.props as any).children);
      }
    }
    if (Array.isArray(node)) {
      return node.map(getCodeContent).join('');
    }
    return '';
  };

  const handleCopy = async () => {
    try {
      const codeText = getCodeContent(children);
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      message.success('代码已复制到剪贴板');
      
      // 2秒后重置状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      message.error('复制失败，请手动复制');
    }
  };

  // 检测是否为代码块
  const isCodeBlock = className?.includes('language-') || language;
  
  if (!isCodeBlock) {
    return <code className={className}>{children}</code>;
  }

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">
          {language || className?.replace('language-', '') || 'code'}
        </span>
        <Button
          type="text"
          size="small"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          className={`copy-button ${copied ? 'copied' : ''}`}
        >
          {copied ? '已复制' : '复制'}
        </Button>
      </div>
      <pre className={`code-block-content ${className || ''}`}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;