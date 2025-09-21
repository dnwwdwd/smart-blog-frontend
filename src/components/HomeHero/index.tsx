"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSiteSettings } from "@/stores/siteSettingsStore";

export default function HomeHero() {
  const settings = useSiteSettings();
  const fullText = settings?.siteDescription || "记录知识与灵感，分享技术与故事";
  const [display, setDisplay] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 计算每字间隔：移动端稍慢、桌面稍快
  const stepMs = useMemo(() => {
    if (typeof window === "undefined") return 60;
    const isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    return isMobile ? 80 : 50;
  }, [typeof window !== "undefined" && (window as any)?.innerWidth]);

  useEffect(() => {
    const cleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }
    };

    const startTyping = () => {
      cleanup();
      indexRef.current = 0;
      setDisplay("");
      setShowCursor(true);

      timerRef.current = setInterval(() => {
        const i = indexRef.current;
        if (i >= fullText.length) {
          // 完成：隐藏光标，稍等后清空并重新开始
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setShowCursor(false);
          loopTimeoutRef.current = setTimeout(() => {
            startTyping();
          }, 1200);
          return;
        }
        setDisplay((prev) => prev + fullText.charAt(i));
        indexRef.current = i + 1;
      }, stepMs);
    };

    startTyping();

    return cleanup;
  }, [fullText, stepMs]);

  return (
    <div className="home-hero">
      <div className="home-hero-inner">
        <h1 className="home-title">{settings?.siteName || "Smart Blog"}</h1>
        <p
          className="home-subtitle"
          style={{
            fontSize: "clamp(14px, 2.2vw, 18px)",
            lineHeight: 1.7,
            minHeight: "1.7em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          aria-label={fullText}
        >
          {display}
          {/* 光标：打字中显示，完成时隐藏 */}
          {showCursor && (
            <span style={{ display: "inline-block", width: "1ch", animation: "blink 1s step-end infinite" }}>▍</span>
          )}
        </p>
      </div>
      {/* 局部声明 blink 动画，避免全局污染 */}
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}