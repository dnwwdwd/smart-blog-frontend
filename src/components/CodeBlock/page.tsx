'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button, message, Tooltip } from 'antd';
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

const CodeBlock: React.FC<CodeBlockProps> = React.memo(({ 
  children, 
  className, 
  language, 
  showLineNumbers = false,
  maxHeight 
}) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // 获取语言类型 - 使用 useMemo 缓存
  const currentLanguage = useMemo(() => {
    if (language) return language;
    if (className) {
      const match = className.match(/language-(\w+)/);
      return match ? match[1] : '';
    }
    return '';
  }, [language, className]);

  // 提取代码内容 - 使用 useMemo 缓存
  const codeText = useMemo(() => {
    const getCodeContent = (node: React.ReactNode): string => {
      if (node == null) return '';
      if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
      }
      if (Array.isArray(node)) {
        return node.map(getCodeContent).join('');
      }
      if (React.isValidElement(node)) {
        const props: any = node.props || {};
        if ('value' in props && typeof props.value === 'string') return props.value;
        if ('children' in props) return getCodeContent(props.children);
        return '';
      }
      return '';
    };
    return getCodeContent(children);
  }, [children]);

  // 生成行号数组 - 使用 useMemo 缓存
  const lineNumbers = useMemo(() => {
    if (!showLineNumbers || !codeText) return [];
    const lines = codeText.split('\n');
    // 移除最后一个空行
    if (lines.length && lines[lines.length - 1] === '') {
      lines.pop();
    }
    return lines.map((_, index) => index + 1);
  }, [codeText, showLineNumbers]);

  // 应用语法高亮 - 优化 useEffect
  useEffect(() => {
    if (!codeRef.current || !codeText) return;

    // 移除之前的高亮标记
    codeRef.current.removeAttribute('data-highlighted');
    
    // 设置代码内容
    codeRef.current.textContent = codeText;

    // 应用语法高亮
    try {
      hljs.highlightElement(codeRef.current);
    } catch (error) {
      console.warn('Syntax highlighting failed:', error);
    }
  }, [currentLanguage, codeText]);

  // 优化复制功能 - 使用 useCallback 缓存
  const handleCopy = useCallback(async () => {
    if (!codeText) return;
    
    try {
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
  }, [codeText]);

  // 获取语言显示名称 - 使用 useMemo 缓存
  const languageDisplayName = useMemo(() => {
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
    return languageNames[currentLanguage.toLowerCase()] || (currentLanguage ? currentLanguage.toUpperCase() : 'CODE');
  }, [currentLanguage]);

  return (
    <div className="code-block-container">
      <div 
        className="code-block-header" 
        data-language={currentLanguage}
      >
        <span className="code-language">
          {languageDisplayName}
        </span>
        <Tooltip title="复制代码" placement="bottom">
          <Button
            type="text"
            size="small"
            icon={copied ? <CheckOutlined style={{color: "#FFFFFF"}} /> : <CopyOutlined style={{color: "#FFFFFF"}} />}
            onClick={handleCopy}
            className={`copy-button ${copied ? 'copied' : ''}`}
            aria-label="复制代码"
          />
        </Tooltip>
      </div>
      <div className="code-block-wrapper">
        {showLineNumbers && lineNumbers.length > 0 && (
          <div className="line-numbers">
            {lineNumbers.map((num) => (
              <span key={num} className="line-number">{num}</span>
            ))}
          </div>
        )}
        <pre 
          className={`code-block-content ${showLineNumbers ? 'with-line-numbers' : ''}`}
          style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
        >
          <code 
            ref={codeRef}
            className={`hljs ${currentLanguage ? `language-${currentLanguage}` : ''}`}
          />
        </pre>
      </div>
    </div>
  );
});

export default CodeBlock;