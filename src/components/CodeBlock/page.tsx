'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // 使用暗黑主题
import './styles.css';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  showLineNumbers?: boolean;
  maxHeight?: number;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  children, 
  className, 
  language, 
  showLineNumbers = false,
  maxHeight 
}) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // 获取语言类型
  const getLanguage = () => {
    if (language) return language;
    if (className) {
      const match = className.match(/language-(\w+)/);
      return match ? match[1] : '';
    }
    return '';
  };
  
  const currentLanguage = getLanguage();
  
  // 应用语法高亮
  useEffect(() => {
    if (codeRef.current && currentLanguage) {
      // 清除之前的高亮
      codeRef.current.removeAttribute('data-highlighted');
      
      // 应用新的高亮
      if (hljs.getLanguage(currentLanguage)) {
        hljs.highlightElement(codeRef.current);
      } else {
        // 如果语言不支持，使用自动检测
        hljs.highlightElement(codeRef.current);
      }
      
      // 添加行号
      if (showLineNumbers && codeRef.current) {
        addLineNumbers();
      }
    }
  }, [currentLanguage, children, showLineNumbers]);
  
  // 添加行号功能
  const addLineNumbers = () => {
    if (!codeRef.current) return;
    
    const code = codeRef.current;
    const lines = code.textContent?.split('\n') || [];
    
    // 移除最后一个空行
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }
    
    const lineNumbersWrapper = code.parentElement?.querySelector('.line-numbers');
    if (lineNumbersWrapper) {
      lineNumbersWrapper.remove();
    }
    
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.innerHTML = lines.map((_, index) => 
      `<span class="line-number">${index + 1}</span>`
    ).join('');
    
    code.parentElement?.appendChild(lineNumbers);
  };
  
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
  
  // 获取语言显示名称
  const getLanguageDisplayName = (lang: string) => {
    const languageNames: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'jsx': 'JSX',
      'tsx': 'TSX',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'csharp': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'scala': 'Scala',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'markdown': 'Markdown',
      'bash': 'Bash',
      'shell': 'Shell',
      'powershell': 'PowerShell',
      'sql': 'SQL',
      'dockerfile': 'Dockerfile',
      'nginx': 'Nginx',
      'apache': 'Apache',
    };
    return languageNames[lang.toLowerCase()] || lang.toUpperCase();
  };
  
  if (!isCodeBlock) {
    return <code className={className}>{children}</code>;
  }

  return (
    <div className="code-block-container">
      <div 
        className="code-block-header" 
        data-language={currentLanguage}
      >
        <span className="code-language">
          {currentLanguage ? getLanguageDisplayName(currentLanguage) : 'CODE'}
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
      <pre 
        className={`code-block-content ${showLineNumbers ? 'with-line-numbers' : ''}`}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
      >
        <code 
          ref={codeRef}
          className={`hljs ${currentLanguage ? `language-${currentLanguage}` : ''}`}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;